import fs from 'fs'
import path from 'path'
import os from 'os'
import crypto from 'crypto'

const deviceIdFilePath = path.join(os.homedir(), '.device-id.json')  // 存在用户目录下

function generateRawFingerprint () {
  return [
    os.platform(),
    os.arch(),
    os.release(),
    os.hostname(),
    Date.now()
  ].join('-');
}

function generateDeviceId () {
  const raw = generateRawFingerprint()
  return crypto.createHash('md5').update(raw).digest('hex')
}

export function getDeviceId () {
  console.log('?????====>',os.homedir());
  try {
    if (fs.existsSync(deviceIdFilePath)) {
      const content = fs.readFileSync(deviceIdFilePath, 'utf-8')
      const parsed = JSON.parse(content)
      if (parsed?.deviceId) return parsed.deviceId
    }

    // 没有文件或读取失败，则新建
    const deviceId = generateDeviceId()
    fs.writeFileSync(deviceIdFilePath, JSON.stringify({ deviceId }), 'utf-8')
    return deviceId
  } catch (err) {
    console.error('[DeviceID] Failed to load or write device id:', err)
    // fallback：直接返回新生成的（不写入）
    return generateDeviceId()
  }
}