import CryptoJS from "crypto-js";

const KEY = process.env.VUE_APP_AES_KEY
const IV = process.env.VUE_APP_AES_IV

const AES_KEY = CryptoJS.enc.Hex.parse(KEY)
const AES_IV = CryptoJS.enc.Hex.parse(IV)

export function encryptPassword(val) {
    const encrypted = CryptoJS.AES.encrypt(val, AES_KEY, {
        iv: AES_IV,
        padding: CryptoJS.pad.Pkcs7,
        mod: CryptoJS.mode.CBC
    })
    return encrypted.toString()
}