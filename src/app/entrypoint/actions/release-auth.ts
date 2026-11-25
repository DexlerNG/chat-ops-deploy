import { createHmac, timingSafeEqual } from "crypto";
import { User } from "@slack/web-api/dist/response/UsersInfoResponse";

export function validSlackRequest(raw: Buffer, timestamp: string, signature: string, secret: string, now = Math.floor(Date.now()/1000)): boolean {
    if (!secret || !/^\d+$/.test(timestamp) || Math.abs(now - Number(timestamp)) > 300 || !/^v0=[a-f0-9]{64}$/.test(signature)) return false;
    const expected = createHmac("sha256", secret).update("v0:" + timestamp + ":").update(raw).digest();
    return timingSafeEqual(expected, Buffer.from(signature.slice(3), "hex"));
}

export function validGithubRequest(raw: Buffer, signature: string, secret: string): boolean {
    if (!secret || !/^sha256=[a-f0-9]{64}$/.test(signature)) return false;
    return timingSafeEqual(createHmac("sha256", secret).update(raw).digest(), Buffer.from(signature.slice(7), "hex"));
}

export function isFullWorkspaceMember(user: User | undefined, workspace: string, sender: string): boolean {
    return Boolean(workspace && sender && user?.id === sender && user.team_id === workspace &&
        user.id !== "USLACKBOT" && user.deleted === false && user.is_bot === false &&
        user.is_restricted === false && user.is_ultra_restricted === false && !user.is_stranger && !user.is_app_user);
}
