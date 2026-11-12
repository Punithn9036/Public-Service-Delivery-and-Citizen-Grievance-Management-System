// backend/src/controllers/serviceController.js
const ServiceModel = require('../../models/service');
const db = require('../db');
const { appendAuditLog } = require('../db/governanceStore');

const getAllServices = async (req, res) => {
  try {
    const services = await ServiceModel.findAll();
    return res.json({
      count: services.length,
      services
    });
  } catch (err) {
    return res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
};

const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await ServiceModel.findById(id);
    if (!service) {
      return res.status(404).json({ error: 'NOT_FOUND', message: `Service '${id}' not found.` });
    }
    return res.json({ service });
  } catch (err) {
    return res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
};

const createService = async (req, res) => {
  try {
    const { serviceName, department, description, slaDays, fee, documentsRequired } = req.body || {};
    if (!serviceName || !department) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'serviceName and department are required.' });
    }
    const list = db.store?.public_services || [];
    const newId = `srv-${list.length + 1}-${Date.now().toString().slice(-4)}`;
    const record = {
      id: newId,
      serviceName: String(serviceName).trim(),
      department: String(department).trim(),
      description: String(description || '').trim(),
      slaDays: Math.max(1, Number(slaDays) || 7),
      fee: String(fee || 'Free (Online)').trim(),
      documentsRequired: Array.isArray(documentsRequired)
        ? documentsRequired
        : String(documentsRequired || 'Aadhaar ID').split(',').map((s) => s.trim()).filter(Boolean)
    };
    list.push(record);
    if (typeof db.saveStore === 'function') db.saveStore();
    appendAuditLog({
      actorEmail: req.user?.email,
      actorRole: req.user?.role,
      action: 'CREATE_PUBLIC_SERVICE',
      targetType: 'SERVICE',
      targetId: newId,
      details: `Added '${record.serviceName}' under ${record.department} (SLA: ${record.slaDays}d)`
    });
    return res.status(201).json({ success: true, service: record });
  } catch (err) {
    return res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
};

const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const list = db.store?.public_services || [];
    const idx = list.findIndex((s) => s.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'NOT_FOUND', message: `Service '${id}' not found.` });
    }
    const patch = req.body || {};
    list[idx] = {
      ...list[idx],
      ...(patch.serviceName !== undefined ? { serviceName: String(patch.serviceName).trim() } : {}),
      ...(patch.department !== undefined ? { department: String(patch.department).trim() } : {}),
      ...(patch.description !== undefined ? { description: String(patch.description).trim() } : {}),
      ...(patch.slaDays !== undefined ? { slaDays: Math.max(1, Number(patch.slaDays) || list[idx].slaDays) } : {}),
      ...(patch.fee !== undefined ? { fee: String(patch.fee).trim() } : {}),
      ...(patch.documentsRequired !== undefined
        ? {
            documentsRequired: Array.isArray(patch.documentsRequired)
              ? patch.documentsRequired
              : String(patch.documentsRequired).split(',').map((s) => s.trim()).filter(Boolean)
          }
        : {})
    };
    if (typeof db.saveStore === 'function') db.saveStore();
    appendAuditLog({
      actorEmail: req.user?.email,
      actorRole: req.user?.role,
      action: 'UPDATE_PUBLIC_SERVICE',
      targetType: 'SERVICE',
      targetId: id,
      details: `Updated '${list[idx].serviceName}' (SLA: ${list[idx].slaDays}d, Fee: ${list[idx].fee})`
    });
    return res.json({ success: true, service: list[idx] });
  } catch (err) {
    return res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
};

module.exports = {
  getAllServices,
  getServiceById,
  createService,
  updateService
};
