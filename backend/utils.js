import { createSecretKey } from 'crypto';
import { jwtVerify } from 'jose';
import { Role, parseRole } from '@gym-manager/models/role.js'

const JWT_KEY = createSecretKey(process.env.JWT_KEY || "secret");
const ISSUER = process.env.JWT_ISSUER || "iss";
const AUDIENCE = process.env.JWT_AUDIENCE || "aud";

const createAuthMiddleware = (roles) => async function authMiddleware(req, res, next) {
    if (req.headers["authorization"] !== undefined) {
        let jwt = req.headers["authorization"].split(' ')[1];
        const { payload, _ } = await verifyJWT(jwt);
        const jwt_payload = payload;
        if (jwt_payload.error === undefined && roles.has(parseRole(jwt_payload.role))) {
            // JWT is still valid
            req.user = jwt_payload.profile
            req.user.role = parseRole(jwt_payload.role);
        } else {
            res.contentType("text/plain").status(401).send(`Invalid token${jwt_payload.error === undefined ? "" : ": " + jwt_payload.error.code}`);
            return;
        }
    }
    next();
};

const _JWT_KEY = JWT_KEY;
export { _JWT_KEY as JWT_KEY };
const _ISSUER = ISSUER;
export { _ISSUER as ISSUER };
const _AUDIENCE = AUDIENCE;
export { _AUDIENCE as AUDIENCE };
const _createAuthMiddleware = createAuthMiddleware;
export { _createAuthMiddleware as createAuthMiddleware };
export function wrapMiddleware(wrapping, wrapped) { return (req, res, next) => wrapping(req, res, () => wrapped(req, res, next)); }
export const customerAuth = createAuthMiddleware(new Set([Role.Admin, Role.User]));
export const adminAuth = createAuthMiddleware(new Set([Role.Admin]));
export const trainerAuth = createAuthMiddleware(new Set([Role.Trainer, Role.Admin]));
export const anyAuth = createAuthMiddleware(new Set([Role.User, Role.Trainer, Role.Admin]));
export async function verifyJWT(jwt) {
    return await jwtVerify(jwt, JWT_KEY, {
        issuer: ISSUER,
        audience: [AUDIENCE]
    }).catch((e) => { return { payload: { error: e }, protectedHeader: null }; });
}
