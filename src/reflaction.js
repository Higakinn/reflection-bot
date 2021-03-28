// LINE developersのメッセージ送受信設定に記載のアクセストークン
var ACCESS_TOKEN = '***';
var USER_ID = '***'
function doPost(e) {
  // WebHookで受信した応答用Token
  var replyToken = JSON.parse(e.postData.contents).events[0].replyToken;
  // ユーザーのメッセージを取得
  var userMessage = JSON.parse(e.postData.contents).events[0].message.text;
  // 応答メッセージ用のAPI URL
  var url = 'https://api.line.me/v2/bot/message/reply';

  UrlFetchApp.fetch(url, {
    'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer ' + ACCESS_TOKEN,
    },
    'method': 'post',
    'payload': JSON.stringify({
      'replyToken': replyToken,
      'messages': [{
        'type': 'text',
        'text': userMessage + 'ンゴ',
      }],
    }),
    });
  return ContentService.createTextOutput(JSON.stringify({'content': 'post ok'})).setMimeType(ContentService.MimeType.JSON);
}

//送信するメッセージ定義する関数を作成します。
function createMessage() {
    //メッセージを定義する
    message = "おはよう！";
    return push(message);
  }
  
//実際にメッセージを送信する関数を作成します。
function push(text) {
    //メッセージを送信(push)する時に必要なurlでこれは、皆同じなので、修正する必要ありません。
    //この関数は全て基本コピペで大丈夫です。
      var url = "https://api.line.me/v2/bot/message/push";
      var headers = {
        "Content-Type" : "application/json; charset=UTF-8",
        'Authorization': 'Bearer ' + ACCESS_TOKEN,
      };
    
      //toのところにメッセージを送信したいユーザーのIDを指定します。(toは最初の方で自分のIDを指定したので、linebotから自分に送信されることになります。)
      //textの部分は、送信されるメッセージが入ります。createMessageという関数で定義したメッセージがここに入ります。
      var postData = {
        "to" : USER_ID,
        "messages" : [
          {
            'type':'text',
            'text':text,
          }
        ]
      };
    
      var options = {
        "method" : "post",
        "headers" : headers,
        "payload" : JSON.stringify(postData)
      };
    
      return UrlFetchApp.fetch(url, options);
    }