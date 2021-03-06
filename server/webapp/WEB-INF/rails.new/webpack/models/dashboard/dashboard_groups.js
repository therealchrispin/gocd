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

const _ = require('lodash');

function Group({name, can_administer, pipelines}) { // eslint-disable-line camelcase
  const self = this;

  this.name          = name;
  this.canAdminister = can_administer; // eslint-disable-line camelcase
  this.pipelines     = pipelines;

  this.resolvePipelines = (resolver) => {
    return _.map(self.pipelines, (pipelineName) => resolver.findPipeline(pipelineName));
  };

  this.select = (filter) => {
    const pipelines = _.filter(this.pipelines, filter);
    if (pipelines.length === 0) {
      return false;
    }
    return new Group({name, can_administer, pipelines}); // eslint-disable-line camelcase
  };
}

function DashboardGroups(groups) {
  this.groups = groups;

  this.select = (filter) => {
    return new DashboardGroups(_.compact(_.map(this.groups, (group) => {
      return group.select(filter);
    })));
  };
}

DashboardGroups.fromJSON = (json) => {
  return new DashboardGroups(_.map(json, (group) => new Group(group)));
};

DashboardGroups.Group = Group;

module.exports = DashboardGroups;
