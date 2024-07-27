"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.Connection = void 0;
const grpc = __importStar(require("@grpc/grpc-js"));
const fabric_gateway_1 = require("@hyperledger/fabric-gateway");
const crypto = __importStar(require("crypto"));
const path = __importStar(require("path"));
const fs_1 = require("fs");
const channelName = envOrDefault('CHANNEL_NAME', 'mychannel');
const chaincodeName = envOrDefault('CHAINCODE_NAME', 'basic');
const mspId = envOrDefault('MSP_ID', 'Org1MSP');
//Local development and testing uncomment below code
const WORKSHOP_CRYPTO = envOrDefault('CRYPTO_PATH', path.resolve(__dirname, '..', '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com'));
// const keyPath = WORKSHOP_CRYPTO + "/enrollments/org1/users/org1user/msp/keystore/key.pem";
const keyPath = WORKSHOP_CRYPTO + "/users/User1@org1.example.com/msp/keystore/09e1ff094c37c310bc3324c03f9bc75754188435246a7fc70c1a676015c887cd_sk";
const certPath = WORKSHOP_CRYPTO + "/users/User1@org1.example.com/msp/signcerts/cert.pem";
const tlsCertPath = WORKSHOP_CRYPTO + "/peers/peer0.org1.example.com/tls/ca.crt";
// //kubenetes certificates file path
// const WORKSHOP_CRYPTO = "/etc/secret-volume/"
// const keyPath = WORKSHOP_CRYPTO + "keyPath";
// const certPath = WORKSHOP_CRYPTO + "certPath"
// const tlsCertPath = WORKSHOP_CRYPTO + "tlsCertPath";
console.log("keyPath " + keyPath);
console.log("certPath " + certPath);
console.log("tlsCertPath " + tlsCertPath);
const peerEndpoint = "localhost:7051";
const peerHostAlias = "peer0.org1.example.com";
class Connection {
    init() {
        initFabric();
    }
}
exports.Connection = Connection;
function initFabric() {
    return __awaiter(this, void 0, void 0, function* () {
        // The gRPC client connection should be shared by all Gateway connections to this endpoint.
        const client = yield newGrpcConnection();
        const gateway = (0, fabric_gateway_1.connect)({
            client,
            identity: yield newIdentity(),
            signer: yield newSigner(),
            // Default timeouts for different gRPC calls
            evaluateOptions: () => {
                return { deadline: Date.now() + 5000 }; // 5 seconds
            },
            endorseOptions: () => {
                return { deadline: Date.now() + 15000 }; // 15 seconds
            },
            submitOptions: () => {
                return { deadline: Date.now() + 5000 }; // 5 seconds
            },
            commitStatusOptions: () => {
                return { deadline: Date.now() + 60000 }; // 1 minute
            },
        });
        try {
            // Get a network instance representing the channel where the smart contract is deployed.
            const network = gateway.getNetwork(channelName);
            // Get the smart contract from the network.
            const contract = network.getContract(chaincodeName);
            Connection.contract = contract;
            // Initialize a set of asset data on the ledger using the chaincode 'InitLedger' function.
            //        await initLedger(contract);
        }
        catch (e) {
            console.log('sample log');
            console.log(e.message);
        }
        finally {
            console.log('error log ');
            // gateway.close();
            // client.close();
        }
    });
}
function newGrpcConnection() {
    return __awaiter(this, void 0, void 0, function* () {
        const tlsRootCert = yield fs_1.promises.readFile(tlsCertPath);
        const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
        return new grpc.Client(peerEndpoint, tlsCredentials, {
            'grpc.ssl_target_name_override': peerHostAlias,
        });
    });
}
function newIdentity() {
    return __awaiter(this, void 0, void 0, function* () {
        const credentials = yield fs_1.promises.readFile(certPath);
        return { mspId, credentials };
    });
}
function newSigner() {
    return __awaiter(this, void 0, void 0, function* () {
        //const files = await fs.readdir(keyDirectoryPath);
        // path.resolve(keyDirectoryPath, files[0]);
        const privateKeyPem = yield fs_1.promises.readFile(keyPath);
        const privateKey = crypto.createPrivateKey(privateKeyPem);
        return fabric_gateway_1.signers.newPrivateKeySigner(privateKey);
    });
}
/**
 * envOrDefault() will return the value of an environment variable, or a default value if the variable is undefined.
 */
function envOrDefault(key, defaultValue) {
    return process.env[key] || defaultValue;
}
