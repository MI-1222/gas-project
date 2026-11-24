/**
 * Google Apps Scriptのグローバルオブジェクトのモック
 */

// UrlFetchAppのモック
global.UrlFetchApp = {
  fetch: jest.fn(),
  fetchAll: jest.fn(),
  getRequest: jest.fn(),
} as any;

// GmailAppのモック definition
const mockGmailMessage = {
  getId: jest.fn(),
  getThreadId: jest.fn(),
  getSubject: jest.fn(),
  getFrom: jest.fn(),
  getTo: jest.fn(),
  getDate: jest.fn(),
  getBody: jest.fn(),
  getPlainBody: jest.fn(),
  isStarred: jest.fn(),
  isUnread: jest.fn(),
  markRead: jest.fn(),
  markUnread: jest.fn(),
  star: jest.fn(),
  unstar: jest.fn(),
  moveToTrash: jest.fn(),
};

const mockGmailThread = {
  getId: jest.fn(),
  getFirstMessageSubject: jest.fn(),
  getMessages: jest.fn().mockReturnValue([mockGmailMessage]),
  getMessageCount: jest.fn(),
  getLastMessageDate: jest.fn(),
  isUnread: jest.fn(),
  markRead: jest.fn(),
  markImportant: jest.fn(),
  markUnimportant: jest.fn(),
  moveToTrash: jest.fn(),
};

// GmailApp本体のモック
global.GmailApp = {
  search: jest.fn().mockReturnValue([mockGmailThread]),
  getInboxThreads: jest.fn(),
  getThreadById: jest.fn(),
  getMessageById: jest.fn(),
  sendEmail: jest.fn(),
  createDraft: jest.fn(),
} as any;

// SpreadsheetAppのモック
const mockSheet = {
  getName: jest.fn(),
  getLastRow: jest.fn(),
  getLastColumn: jest.fn(),
  getRange: jest.fn().mockReturnValue({
    getValues: jest.fn().mockReturnValue([[]]),
    getValue: jest.fn(),
    setValue: jest.fn(),
    setValues: jest.fn(),
    clearContent: jest.fn(),
  }),
  appendRow: jest.fn(),
  insertRowBefore: jest.fn(),
  createTextFinder: jest.fn().mockReturnValue({
    findAll: jest.fn().mockReturnValue([]),
  }),
};

const mockSpreadsheet = {
  getId: jest.fn(),
  getName: jest.fn(),
  getSheetByName: jest.fn().mockReturnValue(mockSheet),
  getSheets: jest.fn().mockReturnValue([mockSheet]),
  getUrl: jest.fn(),
};

global.SpreadsheetApp = {
  create: jest.fn(),
  openById: jest.fn().mockReturnValue(mockSpreadsheet),
  openByUrl: jest.fn(),
  getActiveSpreadsheet: jest.fn().mockReturnValue(mockSpreadsheet),
  getActiveSheet: jest.fn().mockReturnValue(mockSheet),
} as any;

// Utilitiesのモック
global.Utilities = {
  formatDate: jest.fn((date, timeZone, format) => {
    return `Formatted Date: ${date} ${format}`; // 検証用に文字列を返す
  }),
  base64Encode: jest.fn(),
  base64Decode: jest.fn(),
  newBlob: jest.fn(),
} as any;

// Loggerのモック
global.Logger = {
  log: jest.fn(),
  clear: jest.fn(),
  getLog: jest.fn(),
} as any;

// Sessionのモック
global.Session = {
  getActiveUser: jest.fn().mockReturnValue({
    getEmail: jest.fn().mockReturnValue("test@example.com"),
    getUserLoginId: jest.fn(),
  }),
  getEffectiveUser: jest.fn(),
  getScriptTimeZone: jest.fn().mockReturnValue("Asia/Tokyo"),
} as any;
