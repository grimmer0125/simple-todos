import { Meteor } from 'meteor/meteor';

import SessionManager from '../api/SessionManager';
import { Images } from '../api/Images';
import Commands from '../api/Commands';
// redux part
const RECEIVE_IMAGE_CHANGE = 'RECEIVE_IMAGE_CHANGE';
export const Actions = {
  RECEIVE_IMAGE_CHANGE,
};

function reflectMongoImageAddToStore(imageData) {
  console.log('reflect image:', imageData);
  return {
    type: RECEIVE_IMAGE_CHANGE,
    payload: {
      imageData,
    },
  };
}

function prepareImageViewer() {
  return (dispatch) => {
    Meteor.subscribe('images', SessionManager.get(), () => {
      console.log('images subscribes OK !!!');
    });

    const imageObservationHandle = Images.find().observe({
      added(newDoc) {
        console.log('get image Mongo added');
        dispatch(reflectMongoImageAddToStore(newDoc));
      },
      changed(newDoc, oldDoc) {
        console.log('get image Mongo changed');
        dispatch(reflectMongoImageAddToStore(newDoc));
      },
    });

    // ref: https://github.com/cartavis/carta/blob/develop/carta/html5/common/skel/source/class/skel/widgets/Window/DisplayWindow.js
    // var paramMap = "pluginId:" + this.m_pluginId + ",index:"+index;
    // var pathDict = skel.widgets.Path.getInstance();
    // var regCmd = pathDict.getCommandRegisterView();
    // console.log("grimmer x2");

    // 'pluginId:ImageViewer,index:0';
    const cmd = Commands.REGISTER_IMAGEVIEWER; // '/CartaObjects/ViewManager:registerView';
    const params = 'pluginId:ImageViewer,index:0';
    // this.BASE_PATH = this.SEP + this.CARTA + this.SEP;
    // return `${this.BASE_PATH + this.VIEW_MANAGER + this.SEP_COMMAND}registerView`;

    Meteor.call('sendCommand', cmd, params, (error, result) => {
      console.log('get command dummy result:', result);
    });
  };
}

export function saveImageToMongo(data) {
  console.log('saveImageToMongo');
  const images = Images.find().fetch();
  if (images.length > 0) {
    console.log('save image by update');
    Images.update(images[0]._id, { $set: data });
  } else {
    console.log('save image by insert');
    Images.insert({ ...data, session: SessionManager.get() });
  }
}

const actions = {
  prepareImageViewer,
};

export default actions;