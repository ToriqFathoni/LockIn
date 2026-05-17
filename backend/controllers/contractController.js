const contractService = require('../services/contractService');

async function createContract(req, res) {
  try {
    const clientId = req.user.id;
    const { bid_id, started_at, ended_at } = req.body || {};

    if (!bid_id) {
      return res.status(400).json({ error: 'bid_id is required' });
    }

    const contract = await contractService.createContractForClient(clientId, {
      bid_id,
      started_at,
      ended_at,
    });

    return res.status(201).json({ contract });
  } catch (err) {
    console.error('ERROR IN createContract:', err);
    return res.status(500).json({ error: `Server error: ${err.message}` });
  }
}

async function updateContract(req, res) {
  try {
    const clientId = req.user.id;
    const { contractId } = req.params;
    const { status } = req.body || {};

    if (status != null) {
      const allowedStatus = ['on_progress', 'completed', 'cancelled'];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({ error: 'Invalid status. Use: on_progress, completed, cancelled' });
      }
    }

    const contract = await contractService.updateContractForClient(contractId, clientId, req.body || {});
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found or not owned by this client' });
    }

    return res.json({ contract });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function getAllContracts(req, res) {
  try {
    const clientId = req.user.id;
    const contracts = await contractService.getAllContracts(clientId);
    return res.json({ contracts });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function getContractById(req, res) {
  try {
    const { contractId } = req.params;

    const contract = await contractService.getContractById(contractId);
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    return res.json({ contract });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function completeContract(req, res) {
  try {
    const clientId = req.user.id;
    const { contractId } = req.params;
    const { paymentProofUrl } = req.body;
    
    const contract = await contractService.clientCompleteContract(contractId, clientId, paymentProofUrl);
    if (!contract) return res.status(404).json({ error: "Contract not found" });
    res.json({ contract });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}

async function confirmPayment(req, res) {
  try {
    const freelancerId = req.user.id;
    const { contractId } = req.params;
    const contract = await contractService.freelancerConfirmPayment(contractId, freelancerId);
    if (!contract) return res.status(404).json({ error: "Contract not found" });
    res.json({ contract });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}

module.exports = {
  createContract,
  updateContract,
  getAllContracts,
  getContractById,
  completeContract,
  confirmPayment,
};
