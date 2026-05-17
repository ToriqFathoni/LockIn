const bidService = require('../services/bidService');

async function createBid(req, res) {
  try {
    const { project_id, cover_letter, bid_amount, delivery_days, freelancer_id } = req.body || {};

    // Determine who is the actual freelancer for this bid
    // If freelancer_id is provided, it's likely a client creating a bid record for an existing message applicant
    const targetFreelancerId = freelancer_id || req.user.id;

    if (!project_id) {
      return res.status(400).json({ error: 'project_id is required' });
    }

    if (bid_amount == null || Number.isNaN(Number(bid_amount))) {
      return res.status(400).json({ error: 'bid_amount is required and must be a number' });
    }

    const bid = await bidService.createBidForFreelancer(targetFreelancerId, {
      project_id,
      cover_letter,
      bid_amount,
      delivery_days,
    });

    return res.status(201).json({ bid });
  } catch (err) {
    console.error('ERROR IN createBid:', err);
    return res.status(500).json({ error: `Server error: ${err.message}` });
  }
}

async function updateBid(req, res) {
  try {
    const freelancerId = req.user.id;
    const { bidId } = req.params;
    const { bid_amount } = req.body || {};

    if (bid_amount != null && Number.isNaN(Number(bid_amount))) {
      return res.status(400).json({ error: 'bid_amount must be a number' });
    }

    const bid = await bidService.updateBidForFreelancer(bidId, freelancerId, req.body || {});
    if (!bid) {
      return res.status(404).json({ error: 'Bid not found or not owned by this freelancer' });
    }

    return res.json({ bid });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function deleteBid(req, res) {
  try {
    const freelancerId = req.user.id;
    const { bidId } = req.params;

    const deleted = await bidService.deleteBidForFreelancer(bidId, freelancerId);
    if (!deleted) {
      return res.status(404).json({ error: 'Bid not found or not owned by this freelancer' });
    }

    return res.json({ deleted });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function getAllBids(req, res) {
  try {
    const freelancerId = req.user.id;
    const bids = await bidService.getAllBids(freelancerId);
    return res.json({ bids });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function getBidById(req, res) {
  try {
    const freelancerId = req.user.id;
    const { bidId } = req.params;

    const bid = await bidService.getBidByIdAndFreelancerId(bidId, freelancerId);
    if (!bid) {
      return res.status(404).json({ error: 'Bid not found or not owned by this freelancer' });
    }

    return res.json({ bid });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function checkBidStatus(req, res) {
  try {
    const freelancerId = req.user.id;
    const { projectId } = req.params;

    const bid = await bidService.getBidByProjectAndFreelancer(projectId, freelancerId);
    
    // Fallback: check if conversation exists for this job
    let conversation = null;
    if (!bid) {
      const db = require('../database');
      const convResult = await db.query(
        'SELECT id FROM conversations WHERE job_id = $1 AND (user_1_id = $2 OR user_2_id = $3)',
        [projectId, freelancerId, freelancerId]
      );
      conversation = convResult.rows[0] || null;
    }

    return res.json({ 
      applied: !!bid || !!conversation, 
      status: bid ? bid.status : (conversation ? 'pending' : null) 
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function getBidsByProject(req, res) {
  try {
    const { projectId } = req.params;
    const bids = await bidService.getBidsByProject(projectId);
    return res.json({ bids });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function rejectBid(req, res) {
  try {
    const clientId = req.user.id;
    const { bidId } = req.params;

    const bid = await bidService.rejectBidForClient(bidId, clientId);
    if (!bid) {
      return res.status(404).json({ error: 'Bid not found or unauthorized' });
    }

    return res.json({ bid });
  } catch (err) {
    console.error(err);
    if (err.code === 'UNAUTHORIZED') {
      return res.status(403).json({ error: 'Unauthorized: you are not the owner of this project' });
    }
    return res.status(500).json({ error: 'Server error' });
  }
}

module.exports = {
  createBid,
  updateBid,
  deleteBid,
  getAllBids,
  getBidById,
  checkBidStatus,
  getBidsByProject,
  rejectBid,
};
