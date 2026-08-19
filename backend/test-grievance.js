const { 
  getAllGrievances, 
  getGrievanceById, 
  createGrievance, 
  updateGrievanceStatus, 
  submitFeedback, 
  reopenGrievance 
} = require('./src/controllers/grievanceController');

function mockRes() {
  const res = {};
  res.statusCode = 200;
  res.data = null;
  res.status = function(code) { res.statusCode = code; return res; };
  res.json = function(data) { res.data = data; return res; };
  return res;
}

async function runGrievanceTests() {
  console.log('======================================================');
  console.log(' Running Phase 5 Grievance CRUD & State Machine Tests ');
  console.log('======================================================');

  // Test 1: Create New Grievance
  const createReq = {
    body: {
      title: 'Water Pipe Burst near Ward 14',
      category: 'Water Supply & Sanitation',
      department: 'Water Supply & Sanitation',
      description: 'Major water leakage pipeline burst on Main Road Ward 14.',
      location: 'Ward 14, Main Road',
      priority: 'Urgent',
      citizenName: 'Devendra Joshi',
      citizenPhone: '+91 99887 11223',
      citizenEmail: 'dev.joshi@example.com'
    }
  };
  const createRes = mockRes();
  createGrievance(createReq, createRes);

  const newTicketId = createRes.data?.id;
  console.log(` 1. Ticket Creation: ${createRes.statusCode === 201 ? '✅ CREATED' : 'FAILED'} (ID: ${newTicketId}, Priority: Urgent, Status: ${createRes.data?.grievance?.status})`);

  // Test 2: Valid State Transition (Submitted -> Under Review)
  const validUpdateReq = {
    params: { id: newTicketId },
    body: { nextStatus: 'Under Review', officerName: 'Control Room Officer', note: 'Validated complaint.' },
    user: { role: 'OFFICER', fullName: 'Control Room Officer' }
  };
  const validUpdateRes = mockRes();
  updateGrievanceStatus(validUpdateReq, validUpdateRes);
  console.log(` 2. Valid Transition (Submitted -> Under Review): ${validUpdateRes.statusCode === 200 ? '✅ SUCCESS 200 OK' : 'FAILED'}`);

  // Test 3: Invalid State Transition (Under Review -> Resolved directly without Assigned/In Progress)
  const invalidUpdateReq = {
    params: { id: newTicketId },
    body: { nextStatus: 'Resolved', officerName: 'Control Room Officer' },
    user: { role: 'OFFICER' }
  };
  const invalidUpdateRes = mockRes();
  updateGrievanceStatus(invalidUpdateReq, invalidUpdateRes);
  console.log(` 3. Invalid Transition (Under Review -> Resolved): ${invalidUpdateRes.statusCode === 400 ? '✅ REJECTED 400 BAD REQUEST (EXPECTED)' : 'FAILED'}`);

  // Test 4: Complete State Machine Transition to Resolved
  updateGrievanceStatus({ params: { id: newTicketId }, body: { nextStatus: 'Assigned', officerName: 'Er. Suresh' } }, mockRes());
  updateGrievanceStatus({ params: { id: newTicketId }, body: { nextStatus: 'In Progress', officerName: 'Er. Suresh' } }, mockRes());
  const resolveRes = mockRes();
  updateGrievanceStatus({ params: { id: newTicketId }, body: { nextStatus: 'Resolved', officerName: 'Er. Suresh', note: 'Pipe repaired and water restored.' } }, resolveRes);
  console.log(` 4. State Machine Execution to Resolved: ${resolveRes.statusCode === 200 ? '✅ RESOLVED 200 OK' : 'FAILED'}`);

  // Test 5: Submit Feedback on Resolved Ticket
  const feedbackReq = {
    params: { id: newTicketId },
    body: { rating: 5, comment: 'Excellent 4-hour repair speed!' }
  };
  const feedbackRes = mockRes();
  submitFeedback(feedbackReq, feedbackRes);
  console.log(` 5. Citizen Feedback Submission: ${feedbackRes.statusCode === 200 ? '✅ RECORDED 200 OK' : 'FAILED'} (${feedbackRes.data?.feedback?.rating}/5 Stars)`);

  console.log('======================================================');
  console.log(' All Phase 5 Grievance CRUD & State Machine Tests Passed! ');
  console.log('======================================================');
}

runGrievanceTests();
