import SessionManager from '../api/SessionManager';


// // NOTE: follow https://github.com/acdlite/flux-standard-action
// function receiveUIChange(data) {
//   return {
//     type: FILEBROWSER_CHANGE,
//     payload: {
//       data,
//     },
//   };
// }

// const genericActionCreator = (data) => {
//   return {
//     type: actionType,
//     payload:{
//       data,
//     },
//   };
// };


// TODO prevent same collection registering twice
export function setupMongoReduxListeners(collection, dispatch, actionType) {
  const actionCreator = data => ({
    type: actionType,
    payload: {
      data,
    },
  });

  const collectionObservationHandle = collection.find().observe({
    added(newDoc) {
      dispatch(actionCreator(newDoc));
    },
    changed(newDoc, oldDoc) {
      dispatch(actionCreator(newDoc));
    },
    removed(oldDocument) {
      const documents = collection.find().fetch();
      if (documents.length > 0) {
        const doc = documents[0];
        // for watching the shared sessioni from python
        // which may manually remove images on client. special case
        if (!SessionManager.getOtherSession()) {
          dispatch(actionCreator(doc));
        }
      }
    },
  });
}

export function mongoUpsert(collection, newDocObject, actionType) {
  newDocObject.actionType = actionType;
  const sessionID = SessionManager.getSuitableSession();
  const docs = collection.find({ sessionID }).fetch();
  if (docs.length > 0) {
    console.log('update collection, action:', actionType);
    const doc = docs[0];
    const docID = doc._id;
    collection.update(docID, { $set: newDocObject });
  } else {
    console.log('insert collection, action:', actionType);
    newDocObject.sessionID = sessionID;
    const docID = collection.insert(newDocObject);
  }
}
