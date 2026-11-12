// backend/src/controllers/applicationController.js
// Controller for Public Service Applications
const ApplicationModel = require('../../models/application');
const ServiceModel = require('../../models/service');
const { uploadToIPFS } = require('../../utils/ipfs');
const db = require('../db');
const { sendNotification } = require('../../utils/notifications');
const { isSameDepartment } = require('../middleware/departmentAuth');
const { appendAuditLog } = require('../db/governanceStore');

/**
 * Get all service applications with optional status, department, and phone filters
 */
const getAllApplications = async (req, res) => {
  try {
    const { status, department, phone } = req.query;
    let applications = await ApplicationModel.findAll({ status, department, phone });
    if (req.user && req.user.role === 'OFFICER') {
      const services = await ServiceModel.findAll();
      const serviceDeptMap = Object.fromEntries(services.map((s) => [s.id, s.department]));
      applications = applications.filter((item) => {
        const appDept = item.department || serviceDeptMap[item.serviceId];
        return isSameDepartment(req.user.department, appDept);
      });
    }
    return res.json({
      count: applications.length,
      applications
    });
  } catch (err) {
    return res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
};

/**
 * Get single application by ID
 */
const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    const app = await ApplicationModel.findById(id);
    if (app && req.user && req.user.role === 'OFFICER') {
      const srv = app.department ? null : await ServiceModel.findById(app.serviceId);
      const targetDept = app.department || srv?.department;
      if (!isSameDepartment(req.user.department, targetDept)) {
        return res.status(403).json({
          error: 'FORBIDDEN_DEPARTMENT',
          message: `Officers in '${req.user.department}' cannot access applications belonging to '${targetDept || 'another department'}'.`
        });
      }
    }
    if (!app) {
      return res.status(404).json({ error: 'NOT_FOUND', message: `Application '${id}' not found.` });
    }
    return res.json({ application: app });
  } catch (err) {
    return res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
};

/**
 * Submit a new service application
 */
const createApplication = async (req, res) => {
  try {
    const {
      serviceId,
      serviceName,
      department,
      applicantName,
      applicantPhone,
      applicantEmail,
      identityProof,
      identityNumber,
      address,
      ipfsDocumentCid,
      fileContent,
      fileName,
      documents
    } = req.body;

    if (!applicantName || !applicantPhone || (!serviceId && !serviceName)) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'applicantName, applicantPhone, and service details are required.'
      });
    }

    let finalCid = ipfsDocumentCid || null;
    if (fileContent) {
      try {
        const ipfsRes = await uploadToIPFS(fileContent, fileName || 'identity_document.pdf');
        finalCid = (ipfsRes && ipfsRes.cid) ? ipfsRes.cid : (typeof ipfsRes === 'string' ? ipfsRes : finalCid);
      } catch (e) {
        console.warn('IPFS upload warning in createApplication:', e);
      }
    }

    // Lookup service SLA if serviceId provided
    let slaDays = 7;
    let finalServiceName = serviceName;
    let finalDept = department || 'General Administration';

    if (serviceId) {
      const srv = await ServiceModel.findById(serviceId);
      if (srv) {
        slaDays = srv.slaDays || 7;
        finalServiceName = srv.serviceName || finalServiceName;
        finalDept = srv.department || finalDept;
      }
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newId = `APP-${new Date().getFullYear()}-${randomSuffix}`;
    const appliedDate = new Date().toISOString().slice(0, 10);
    const estDate = new Date(Date.now() + slaDays * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const created = await ApplicationModel.create({
      id: newId,
      serviceId: serviceId || 'srv-custom',
      serviceName: finalServiceName || 'Public Service',
      department: finalDept,
      applicantName,
      applicantPhone,
      applicantEmail: applicantEmail || '',
      identityProof: identityProof || 'Aadhaar Card',
      identityNumber: identityNumber || '',
      address: address || '',
      ipfsDocumentCid: finalCid,
      status: 'Submitted',
      appliedDate,
      slaDays,
      estimatedCompletion: estDate,
      remarks: 'Application received and submitted for departmental verification.'
    });

    // Statutory Citizen Notification Dispatch (SMS & WhatsApp)
    try {
      await sendNotification({
        phone: applicantPhone,
        template: 'APPLICATION_SUBMITTED',
        data: {
          id: newId,
          serviceName: finalServiceName,
          slaDays,
          estimatedCompletion: estDate
        }
      });
    } catch (notifErr) {
      console.warn('[Notification Notice] Application submission alert warning:', notifErr.message);
    }

    return res.status(201).json({
      message: 'Service application submitted successfully.',
      id: newId,
      application: created
    });
  } catch (err) {
    return res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
};

/**
 * Update application status (Officer verification)
 */
const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks, verifiedDocuments, resubmissionReason, rejectionReason } = req.body;

    const existingApp = await ApplicationModel.findById(id);
    if (!existingApp) {
      return res.status(404).json({ error: 'NOT_FOUND', message: `Application '${id}' not found.` });
    }

    const linkedService = existingApp.department ? null : await ServiceModel.findById(existingApp.serviceId);
    const targetDepartment = existingApp.department || linkedService?.department;
    if (req.user && req.user.role === 'OFFICER' && !isSameDepartment(req.user.department, targetDepartment)) {
      return res.status(403).json({
        error: 'FORBIDDEN_DEPARTMENT',
        message: `Access denied: Officers in '${req.user.department}' cannot review or update '${existingApp.serviceName}' applications owned by '${targetDepartment || 'another department'}'.`
      });
    }

    if (!status || !['Submitted', 'Under Review', 'In Verification', 'Resubmission Required', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: "Status must be one of ['Submitted', 'In Verification', 'Approved', 'Rejected']."
      });
    }

    const effectiveRemarks = remarks || resubmissionReason || rejectionReason || '';
    const updated = await ApplicationModel.updateStatus(id, { status, remarks: effectiveRemarks });
    if (updated) {
      if (Array.isArray(verifiedDocuments)) {
        updated.verifiedDocuments = verifiedDocuments;
      }
      if (resubmissionReason) {
        updated.resubmissionReason = resubmissionReason;
      }
      if (rejectionReason) {
        updated.rejectionReason = rejectionReason;
      }
      updated.reviewedBy = req.user?.email || 'officer';
      updated.reviewedAt = new Date().toISOString();
      if (typeof db.saveStore === 'function') {
        db.saveStore();
      }
      if (req.user?.role === 'ADMIN') {
        appendAuditLog({
          actorEmail: req.user.email,
          actorRole: req.user.role,
          action: 'APPLICATION_STATUS_UPDATED',
          targetType: 'APPLICATION',
          targetId: id,
          details: `Status set to ${status} (${targetDepartment || 'Municipal'})`
        });
      }
    }
    if (!updated) {
      return res.status(404).json({ error: 'NOT_FOUND', message: `Application '${id}' not found.` });
    }

    // Statutory Citizen Notification Dispatch (SMS & WhatsApp)
    try {
      await sendNotification({
        phone: updated.applicantPhone || '+91 98765 43210',
        template: 'APPLICATION_STATUS_UPDATE',
        data: {
          id,
          serviceName: updated.serviceName,
          status,
          remarks
        }
      });
    } catch (notifErr) {
      console.warn('[Notification Notice] Application status update alert warning:', notifErr.message);
    }

    return res.json({
      message: `Application status updated to '${status}'.`,
      application: updated
    });
  } catch (err) {
    return res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
};

module.exports = {
  getAllApplications,
  getApplicationById,
  createApplication,
  updateApplicationStatus
};
