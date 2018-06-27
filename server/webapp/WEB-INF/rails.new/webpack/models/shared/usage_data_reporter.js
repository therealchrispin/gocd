/*
 * Copyright 2018 ThoughtWorks, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const _          = require('lodash');
const AjaxHelper = require('helpers/ajax_helper');

const UsageData     = require('models/shared/data_sharing/usage_data');
const DataReporting = require('models/shared/data_sharing/data_reporting');

const USAGE_DATA_LAST_REPORTED_TIME_KEY = "usage_data_last_reported_time";

const reportToGoCDDataSharingServer = function (url, data) {
  return AjaxHelper.POST({url, data, contentType: 'application/octet-stream'});
};

const canTryToReportingUsageData = () => {
  let lastReportedTime = localStorage.getItem(USAGE_DATA_LAST_REPORTED_TIME_KEY);
  if (_.isEmpty(lastReportedTime)) {
    return true;
  }

  lastReportedTime   = JSON.parse(lastReportedTime);
  const lastUpdateAt = new Date(lastReportedTime);
  const halfHourAgo  = new Date(_.now() - 30 * 60 * 1000);
  return halfHourAgo > lastUpdateAt;
};

const markReportingCheckDone = () => {
  localStorage.setItem(USAGE_DATA_LAST_REPORTED_TIME_KEY, `${new Date().getTime()}`);
};

const UsageDataReporter = function () {
  this.report = async () => {
    if (!canTryToReportingUsageData()) {
      return;
    }

    const reportingInfo = await DataReporting.get();

    try {
      if (reportingInfo.canReport()) {
        const encryptedUsageData = await UsageData.getEncrypted();
        await reportToGoCDDataSharingServer(reportingInfo.dataSharingServerUrl(), encryptedUsageData);
        await DataReporting.markReported();
      }
    } finally {
      markReportingCheckDone();
    }
  };
};

module.exports = UsageDataReporter;


