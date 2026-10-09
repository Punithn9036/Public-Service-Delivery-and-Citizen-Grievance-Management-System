// backend/src/controllers/applicationController.js
// Controller for Public Service Applications
const ApplicationModel = require('../../models/application');
const ServiceModel = require('../../models/service');

/**
 * Get all service applications with optional status, department, and phone filters
 */
const getAllApplications = async (req, res) => {
  try {
    const { status, department, phone } = req.query;
    const applications = await ApplicationModel.findAll({ status, department, phone });
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
      documents
    } = req.body;

    if (!applicantName || !applicantPhone || (!serviceId && !serviceName)) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'applicantName, applicantPhone, and service details are required.'
      });
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
      status: 'Submitted',
      appliedDate,
      slaDays,
      estimatedCompletion: estDate,
      remarks: 'Application received and submitted for departmental verification.'
    });

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
    const { status, remarks } = req.body;

    if (!status || !['Submitted', 'In Verification', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: "Status must be one of ['Submitted', 'In Verification', 'Approved', 'Rejected']."
      });
    }

    const updated = await ApplicationModel.updateStatus(id, { status, remarks });
    if (!updated) {
      return res.status(404).json({ error: 'NOT_FOUND', message: `Application '${id}' not found.` });
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
