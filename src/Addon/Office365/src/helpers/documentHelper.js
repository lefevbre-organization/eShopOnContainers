/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

/* global Excel, Office, OfficeExtension, Word */

export function writeDataToOfficeDocument(result) {
  return new OfficeExtension.Promise(function(resolve, reject) {
    try {
      writeDataToOutlook(result);
      resolve();
    } catch (error) {
      reject(Error("Unable to write data to message. " + error.toString()));
    }
  });
}

function filterOneDriveInfo(result) {
  let itemNames = [];
  let oneDriveItems = result['value'];
  for (let item of oneDriveItems) {
    itemNames.push(item['name']);
  }
  return itemNames;
}

function writeDataToOutlook(result) {
  let data = [];
  let oneDriveInfo = filterOneDriveInfo(result);

  for (let i = 0; i < oneDriveInfo.length; i++) {
    if (oneDriveInfo[i] !== null) {
      data.push(oneDriveInfo[i]);
    }
  }

  let objectNames = "";
  for (let i = 0; i < data.length; i++) {
    objectNames += data[i] + "<br/>";
  }

  Office.context.mailbox.item.body.setSelectedDataAsync(objectNames, { coercionType: Office.CoercionType.Html });
}

