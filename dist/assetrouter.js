"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetRouter = void 0;
const utf8Decoder = new TextDecoder();
const connection_1 = require("./connection");
class AssetRouter {
    routes(app) {
        app.route('/list')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            const resultBytes = connection_1.Connection.contract.evaluateTransaction('GetAllAssets');
            const resultJson = utf8Decoder.decode(yield resultBytes);
            const result = JSON.parse(resultJson);
            res.status(200).send(result);
        }));
        app.route('/create')
            .post((req, res) => {
            console.log(req.body);
            var Id = Date.now();
            var json = JSON.stringify({
                ID: Id + "",
                Owner: req.body.Owner,
                Color: req.body.Color,
                Size: req.body.Size,
                AppraisedValue: req.body.AppraisedValue,
            });
            connection_1.Connection.contract.submitTransaction('CreateAsset', json);
            var response = ({ "AssetId": Id });
            res.status(200).send(response);
        });
        app.route('/update')
            .post((req, res) => {
            console.log(req.body);
            var Id = Date.now();
            var json = JSON.stringify({
                ID: req.body.ID,
                Owner: req.body.Owner,
                Color: req.body.Color,
                Size: req.body.Size,
                AppraisedValue: req.body.AppraisedValue,
            });
            var response;
            try {
                connection_1.Connection.contract.submitTransaction('UpdateAsset', json);
                response = ({ "status": 0, "message": "Update success" });
            }
            catch (error) {
                response = ({ "status": -1, "message": "Something went wrong" });
            }
            res.status(200).send(response);
        });
        app.route('/delete')
            .post((req, res) => {
            console.log(req.body);
            var response;
            try {
                connection_1.Connection.contract.submitTransaction('DeleteAsset', req.body.id);
                response = ({ "status": 0, "message": "Delete success" });
            }
            catch (error) {
                response = ({ "status": -1, "message": "Something went wrong" });
            }
            res.status(200).send(response);
        });
        app.route('/transfer')
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            console.log(req.body);
            console.log('\n--> Async Submit Transaction: TransferAsset, updates existing asset owner');
            const commit = connection_1.Connection.contract.submitAsync('TransferAsset', {
                arguments: [req.body.assetId, 'Saptha'],
            });
            const oldOwner = utf8Decoder.decode((yield commit).getResult());
            console.log(`*** Successfully submitted transaction to transfer ownership from ${oldOwner} to Saptha`);
            console.log('*** Waiting for transaction commit');
            const status = yield (yield commit).getStatus();
            if (!status.successful) {
                throw new Error(`Transaction ${status.transactionId} failed to commit with status code ${status.code}`);
            }
            console.log('*** Transaction committed successfully');
            res.status(200).send(status);
        }));
        app.route('/updateNonExistentAsset')
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield connection_1.Connection.contract.submitTransaction('UpdateAsset', 'asset70', 'blue', '5', 'Tomoko', '300');
                console.log('******** FAILED to return an error');
            }
            catch (error) {
                console.log('*** Successfully caught the error: \n', error);
            }
            res.status(200).send("Success");
        }));
        app.route('/get/:id')
            .get((req, res) => __awaiter(this, void 0, void 0, function* () {
            let id = req.params.id;
            console.log('\n--> Evaluate Transaction: ReadAsset, function returns asset attributes');
            const resultBytes = connection_1.Connection.contract.evaluateTransaction('ReadAsset', id);
            const resultJson = utf8Decoder.decode(yield resultBytes);
            const result = JSON.parse(resultJson);
            console.log('*** Result:', result);
            res.status(200).send(result);
        }));
    }
}
exports.AssetRouter = AssetRouter;
