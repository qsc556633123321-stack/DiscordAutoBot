const RoadmapPublicationMessageMutationKind = Object.freeze({
  EditSuccess: 'EditSuccess',
  SendSuccess: 'SendSuccess'
});

function createRoadmapPublicationMessageEditRequest(input = {}) {
  return Object.freeze({
    messageId: input?.messageId,
    payload: input?.payload
  });
}

function createRoadmapPublicationMessageSendRequest(input = {}) {
  return Object.freeze({ payload: input?.payload });
}

function createRoadmapPublicationMessageEditSuccess(input = {}) {
  return Object.freeze({
    kind: RoadmapPublicationMessageMutationKind.EditSuccess,
    messageId: input?.messageId
  });
}

function createRoadmapPublicationMessageSendSuccess(input = {}) {
  return Object.freeze({
    kind: RoadmapPublicationMessageMutationKind.SendSuccess,
    messageId: input?.messageId
  });
}

function assertRoadmapPublicationMessageMutationPort(port) {
  if (!port || typeof port.edit !== 'function' || typeof port.send !== 'function') {
    throw new Error('RoadmapPublicationMessageMutationPort requires edit and send methods');
  }
}

module.exports = {
  RoadmapPublicationMessageMutationKind,
  createRoadmapPublicationMessageEditRequest,
  createRoadmapPublicationMessageSendRequest,
  createRoadmapPublicationMessageEditSuccess,
  createRoadmapPublicationMessageSendSuccess,
  assertRoadmapPublicationMessageMutationPort
};
