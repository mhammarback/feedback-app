import * as React from 'react';
import { renderToString } from 'react-dom/server';
import router from '@sitevision/api/common/router';
import appData from '@sitevision/api/server/appData';
import App from './components/App';
import storage from '@sitevision/api/server/storage';
import properties from '@sitevision/api/server/Properties';
import portletContextUtil from '@sitevision/api/server/PortletContextUtil';
import systemUserUtil from '@sitevision/api/server/SystemUserUtil';
import { getPrevFeedback } from './utils/dataStoreProvider';

import mailUtil from "@sitevision/api/server/MailUtil";
import logUtil from '@sitevision/api/server/LogUtil';

import versionUtil, { ONLINE_VERSION } from '@sitevision/api/server/VersionUtil';


import roleUtil from '@sitevision/api/server/RoleUtil';
import roleMathcer from '@sitevision/api/server/RoleMatcher';
import roleMatcherBuilder from '@sitevision/api/server/RoleMatcherBuilder';

const feedbackStore = storage.getCollectionDataStore('feedbackStore');

//middleware
router.use((req, res, next) => {
  if (systemUserUtil.isAnonymous()) {
    return;
  }

  var version = versionUtil.getCurrentVersion();
  if(version !== ONLINE_VERSION) {
    return;
  }

  (req.data = { currentUser: portletContextUtil.getCurrentUser() });

  next();
});

router.get('/', (req, res) => {
  const name = properties.get(req.data.currentUser, 'displayName');
  const name2 = appData.get('name');
  const prevFeedback = getPrevFeedback();

  var currentPage = portletContextUtil.getCurrentPage();
  var pageName = properties.get(currentPage, "displayName");
  var version = versionUtil.getCurrentVersion();

  res.agnosticRender(renderToString(<App version={version} pageName={pageName} name={name} prevFeedback={prevFeedback} name2={name2}  />),{
    name,
    name2,
    pageName,
    prevFeedback,
  });
});


router.get('/getFeedback', (req, res) => {
  const feedbackValue = appData.get('page', req.params.property);

  if (!feedbackValue) {
    return res
    .status(400)
  }

  try {
    const { dsid } = feedbackStore.add({
      input: req.params.property,
      value: feedbackValue,
      user: req.data.currentUser.getIdentifier(),
    });
    feedbackStore.instantIndex(dsid);
  } catch (e) {
    console.error(JSON.stringify(e));
  };

  const prevFeedback = getPrevFeedback();

  res.json({
    feedbackValue,
    prevFeedback,
  });
});

router.post('/postFeedback', (req,res) => {
  var currentPage = portletContextUtil.getCurrentPage();
  var pageName = properties.get(currentPage, 'displayName');
  var pageId = properties.get(currentPage, 'shortId')
  var pageUrl = properties.get(currentPage, "URL");
  var user = properties.get(req.data.currentUser, 'displayName');

  const { dsid } = feedbackStore.add({
    input: req.params.property,
    user: req.data.currentUser.getIdentifier(),
    userName: user,
    pageId: pageId,
    pageName: pageName
  });
  feedbackStore.instantIndex(dsid);

  const prevFeedback = getPrevFeedback();

  res.json({
    prevFeedback
  });
});


router.post('/vote', (req,res) => {
  var currentPage = portletContextUtil.getCurrentPage();
  var pageName = properties.get(currentPage, 'displayName');
  var pageUrl = properties.get(currentPage, "URL");
  //var feedbackValue = appData.get('page', req.params.property)

  var mailBuilder = mailUtil.getMailBuilder();
  var subject = "En sida har fått feedback!";
  mailBuilder.setSubject(subject);

  var now = new Date();
  var msg = "En användare";
      msg += " har tyckt till om sidan " + pageName + " ( " + pageUrl + " ) ";

      if (pageUrl !== req.params.clienthref) {
        msg = msg + '\n\nKomplett URL till sidan: ' + req.params.clienthref;
      }
      //msg = msg + "\n\nWebbläsare: " + req.params.useragent;
      msg = msg + "\n\nInskickat: " + now.toLocaleDateString();

      logUtil.debug(msg);

      mailBuilder.setTextMessage(msg);
      if (appData.get('email')) {
        mailBuilder.addRecipient(appData.get('email'));
      } else {
        mailBuilder.addRecipient("moa.hammarback@webstep.se")
      }

      var mail = mailBuilder.build();
      var response = {};
      try {
        mail.send();
        logUtil.debug("user added feedback on" + pageName);
        response = {
          status: "OK"
        };
      } catch(err) {
        logUtil.error(err);
        response = {
          status: "ERROR",
        };
      }

    res.json(response);
});
