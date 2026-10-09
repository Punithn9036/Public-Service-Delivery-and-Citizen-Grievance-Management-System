// backend/src/controllers/serviceController.js
const ServiceModel = require('../../models/service');

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

module.exports = {
  getAllServices,
  getServiceById
};
