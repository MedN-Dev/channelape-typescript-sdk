import { expect } from 'chai';
import * as sinon from 'sinon';
import request = require('request');
import ActionsService from './../../../src/actions/service/ActionsService';
import Version from '../../../src/model/Version';
import Resource from '../../../src/model/Resource';
import Subresource from '../../../src/actions/model/Subresource';
import Environment from '../../../src/model/Environment';
import ChannelApeErrorResponse from '../../../src/model/ChannelApeErrorResponse';
import Action from '../../../src/actions/model/Action';

describe('Actions Service', () => {

  describe('Given some rest client', () => {
    const client = request.defaults({
      baseUrl: Environment.STAGING,
      timeout: 60000,
      json: true
    });

    let sandbox: sinon.SinonSandbox;

    const expectedErrorAction: Action = {
      action: 'PRODUCT_PULL',
      businessId: '4baafa5b-4fbf-404e-9766-8a02ad45c3a4',
      description: 'Encountered error during product pull for Europa Sports',
      healthCheckIntervalInSeconds: 300,
      id: 'a85d7463-a2f2-46ae-95a1-549e70ecb2ca',
      lastHealthCheckTime: new Date('2018-04-24T14:02:34.703Z'),
      processingStatus: 'error',
      startTime: new Date('2018-04-24T14:02:34.703Z'),
      targetId: '1e4ebaa6-9796-4ccf-bd73-8765893a66bd',
      targetType: 'supplier'
    };

    const expectedCompletedAction: Action = {
      action: 'PRODUCT_PUSH',
      businessId: '4baafa5b-4fbf-404e-9766-8a02ad45c3a4',
      description: 'Completed product push for Custom Column Export',
      healthCheckIntervalInSeconds: 300,
      id: '4da63571-a4c5-4774-ae20-4fee24ab98e5',
      lastHealthCheckTime: new Date('2018-05-01T14:47:58.018Z'),
      processingStatus: 'completed',
      startTime: new Date('2018-05-01T14:47:55.905Z'),
      targetId: '9c728601-0286-457d-b0d6-ec19292d4485',
      targetType: 'channel',
      endTime: new Date('2018-05-01T14:47:58.018Z')
    };

    const expectedChannelApeErrorResponse : ChannelApeErrorResponse = {
      statusCode: 404,
      errors: [
        { 
          code: 111, 
          message: 'Action could not be found.' 
        }
      ]
    };

    const expectedError = {
      stack: 'oh no an error'
    };

    beforeEach((done) => {
      sandbox = sinon.sandbox.create();
      done();
    });

    afterEach((done) => {
      sandbox.restore();
      done();
    });

    it('And valid action ID for error action ' +
      'When retrieving action Then return resolved promise with action', () => {

      const response = {
        statusCode: 200
      };
      const clientGetStub: sinon.SinonStub = sandbox.stub(client, 'get')
          .yields(null, response, expectedErrorAction);

      const actionsService: ActionsService = new ActionsService(client);
      return actionsService.get(expectedErrorAction.id).then((actualAction) => {
        expect(clientGetStub.args[0][0]).to.equal(`/${Version.V1}${Resource.ACTIONS}/${expectedErrorAction.id}`);
        expectErrorAction(expectedErrorAction);
      });
    });

    it('And valid action ID And request connect errors ' +
      'When retrieving action Then return a rejected promise with an error', () => {

      const clientGetStub = sandbox.stub(client, 'get')
        .yields(expectedError, null, null);

      const actionsService: ActionsService = new ActionsService(client);
      return actionsService.get(expectedErrorAction.id).then((actualResponse) => {
        expect(actualResponse).to.be.undefined;
      }).catch((e) => {
        expect(clientGetStub.args[0][0]).to.equal(`/${Version.V1}${Resource.ACTIONS}/${expectedErrorAction.id}`);
        expect(e).to.equal(expectedError);
      });
    });

    it('And invalid action ID ' +
    'When retrieving action Then return a rejected promise with 404 status code ' +
    'And action not found error message', () => {

      const response = {
        statusCode: 404
      };
      const clientGetStub = sandbox.stub(client, 'get')
        .yields(null, response, expectedChannelApeErrorResponse);

      const actionsService: ActionsService = new ActionsService(client);
      return actionsService.get(expectedErrorAction.id).then((actualResponse) => {
        expect(actualResponse).to.be.undefined;
      }).catch((e) => {
        expect(clientGetStub.args[0][0]).to.equal(`/${Version.V1}${Resource.ACTIONS}/${expectedErrorAction.id}`);
        expectChannelApeErrorResponse(e);
      });
    });

    it('And valid action ID ' +
    'When updating action health check Then return resolved promise with action', () => {

      const response = {
        statusCode: 200
      };
      const clientGetStub: sinon.SinonStub = sandbox.stub(client, 'put')
          .yields(null, response, expectedCompletedAction);

      const actionsService: ActionsService = new ActionsService(client);
      return actionsService.updateHealthCheck(expectedCompletedAction.id).then((actualAction) => {
        expect(clientGetStub.args[0][0])
          .to.equal(`/${Version.V1}${Resource.ACTIONS}/${expectedCompletedAction.id}/${Subresource.HEALTH_CHECK}`);
        expectCompletedAction(actualAction);
      });
    });

    it('And valid action ID And request connect errors ' +
    'When updating action health check Then return a rejected promise with an error', () => {

      const expectedError = {
        stack: 'oh no an error'
      };
      const clientGetStub = sandbox.stub(client, 'put')
        .yields(expectedError, null, null);

      const actionsService: ActionsService = new ActionsService(client);
      return actionsService.updateHealthCheck(expectedErrorAction.id).then((actualResponse) => {
        expect(actualResponse).to.be.undefined;
      }).catch((e) => {
        expect(clientGetStub.args[0][0])
          .to.equal(`/${Version.V1}${Resource.ACTIONS}/${expectedErrorAction.id}/${Subresource.HEALTH_CHECK}`);
        expect(e).to.equal(expectedError);
      });
    });

    it('And invalid action ID ' +
    'When updating action health check Then return a rejected promise with 404 status code ' +
    'And action not found error message', () => {

      const response = {
        statusCode: 404
      };

      const clientGetStub = sandbox.stub(client, 'put')
        .yields(null, response, expectedChannelApeErrorResponse);

      const actionsService: ActionsService = new ActionsService(client);
      return actionsService.updateHealthCheck(expectedErrorAction.id).then((actualResponse) => {
        expect(actualResponse).to.be.undefined;
      }).catch((e) => {
        expect(clientGetStub.args[0][0])
          .to.equal(`/${Version.V1}${Resource.ACTIONS}/${expectedErrorAction.id}/${Subresource.HEALTH_CHECK}`);
        expectChannelApeErrorResponse(e);
      });
    });

    it('And valid action ID ' +
    'When completing action Then return resolved promise with action', () => {

      const response = {
        statusCode: 200
      };
      const clientGetStub: sinon.SinonStub = sandbox.stub(client, 'put')
          .yields(null, response, expectedCompletedAction);

      const actionsService: ActionsService = new ActionsService(client);
      return actionsService.complete(expectedCompletedAction.id).then((actualAction) => {
        expect(clientGetStub.args[0][0])
          .to.equal(`/${Version.V1}${Resource.ACTIONS}/${expectedCompletedAction.id}/${Subresource.COMPLETE}`);
        expectCompletedAction(actualAction);
      });
    });

    it('And valid action ID And request connect errors ' +
    'When completing action Then return a rejected promise with an error', () => {

      const expectedError = {
        stack: 'oh no an error'
      };
      const clientGetStub = sandbox.stub(client, 'put')
        .yields(expectedError, null, null);

      const actionsService: ActionsService = new ActionsService(client);
      return actionsService.complete(expectedErrorAction.id).then((actualResponse) => {
        expect(actualResponse).to.be.undefined;
      }).catch((e) => {
        expect(clientGetStub.args[0][0])
          .to.equal(`/${Version.V1}${Resource.ACTIONS}/${expectedErrorAction.id}/${Subresource.COMPLETE}`);
        expect(e).to.equal(expectedError);
      });
    });

    it('And invalid action ID ' +
    'When completing action Then return a rejected promise with 404 status code ' +
    'And action not found error message', () => {

      const response = {
        statusCode: 404
      };

      const clientGetStub = sandbox.stub(client, 'put')
        .yields(null, response, expectedChannelApeErrorResponse);

      const actionsService: ActionsService = new ActionsService(client);
      return actionsService.complete(expectedErrorAction.id).then((actualResponse) => {
        expect(actualResponse).to.be.undefined;
      }).catch((e) => {
        expect(clientGetStub.args[0][0])
          .to.equal(`/${Version.V1}${Resource.ACTIONS}/${expectedErrorAction.id}/${Subresource.COMPLETE}`);
        expectChannelApeErrorResponse(e);
      });
    });

    it('And valid action ID ' +
    'When updating action with error Then return resolved promise with action', () => {

      const response = {
        statusCode: 200
      };
      const clientGetStub: sinon.SinonStub = sandbox.stub(client, 'put')
          .yields(null, response, expectedErrorAction);

      const actionsService: ActionsService = new ActionsService(client);
      return actionsService.error(expectedErrorAction.id).then((actualAction) => {
        expect(clientGetStub.args[0][0])
          .to.equal(`/${Version.V1}${Resource.ACTIONS}/${expectedErrorAction.id}/${Subresource.ERROR}`);
        expectErrorAction(actualAction);
      });
    });

    it('And valid action ID And request connect errors ' +
    'When updating action with error Then return a rejected promise with an error', () => {

      const expectedError = {
        stack: 'oh no an error'
      };
      const clientGetStub = sandbox.stub(client, 'put')
        .yields(expectedError, null, null);

      const actionsService: ActionsService = new ActionsService(client);
      return actionsService.error(expectedErrorAction.id).then((actualResponse) => {
        expect(actualResponse).to.be.undefined;
      }).catch((e) => {
        expect(clientGetStub.args[0][0])
          .to.equal(`/${Version.V1}${Resource.ACTIONS}/${expectedErrorAction.id}/${Subresource.ERROR}`);
        expect(e).to.equal(expectedError);
      });
    });

    it('And invalid action ID ' +
    'When updating action with error Then return a rejected promise with 404 status code ' +
    'And action not found error message', () => {

      const response = {
        statusCode: 404
      };

      const clientGetStub = sandbox.stub(client, 'put')
        .yields(null, response, expectedChannelApeErrorResponse);

      const actionsService: ActionsService = new ActionsService(client);
      return actionsService.error(expectedErrorAction.id).then((actualResponse) => {
        expect(actualResponse).to.be.undefined;
      }).catch((e) => {
        expect(clientGetStub.args[0][0])
          .to.equal(`/${Version.V1}${Resource.ACTIONS}/${expectedErrorAction.id}/${Subresource.ERROR}`);
        expectChannelApeErrorResponse(e);
      });
    });

    function expectErrorAction(actualAction: Action) {
      expectAction(expectedErrorAction, actualAction);
      expect(actualAction.endTime).to.equal(undefined);
    }

    function expectCompletedAction(actualAction: Action) {
      expectAction(expectedCompletedAction, actualAction);
      if (actualAction.endTime == null) {
        expect(actualAction.endTime).to.not.equal(undefined);
      } else {
        expect(actualAction.endTime.toISOString())
          .to.equal(actualAction.endTime.toISOString());
      }
    }

    function expectAction(expectedAction: Action, actualAction: Action) {
      expect(actualAction.action).to.equal(expectedAction.action);
      expect(actualAction.businessId).to.equal(expectedAction.businessId);
      expect(actualAction.description).to.equal(expectedAction.description);
      expect(actualAction.healthCheckIntervalInSeconds).to.equal(expectedAction.healthCheckIntervalInSeconds);
      expect(actualAction.id).to.equal(expectedAction.id);
      expect(actualAction.lastHealthCheckTime.toISOString())
        .to.equal(expectedAction.lastHealthCheckTime.toISOString());
      expect(actualAction.processingStatus).to.equal(expectedAction.processingStatus);
      expect(actualAction.startTime.toISOString()).to.equal(expectedAction.startTime.toISOString());
      expect(actualAction.targetId).to.equal(expectedAction.targetId);
      expect(actualAction.targetType).to.equal(expectedAction.targetType);
    }

    function expectChannelApeErrorResponse(error: any) {
      const actualChannelApeErrorResponse = error as ChannelApeErrorResponse;
      expect(actualChannelApeErrorResponse.statusCode).to.equal(404);
      expect(actualChannelApeErrorResponse.errors[0].code).to.equal(expectedChannelApeErrorResponse.errors[0].code);
      expect(actualChannelApeErrorResponse.errors[0].message)
        .to.equal(expectedChannelApeErrorResponse.errors[0].message);
    }

  });
});