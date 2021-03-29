// LINE developersのメッセージ送受信設定に記載のアクセストークン
var ACCESS_TOKEN = '__ACCESS_TOKEN__';
var USER_ID = '__USER_ID__'

function doPost(e) {
    var replyToken = JSON.parse(e.postData.contents).events[0].replyToken;
    var lineType = JSON.parse(e.postData.contents).events[0].type
    if (typeof replyToken === "undefined" || lineType === "follow") {
      return;
    }
    var userMessage = JSON.parse(e.postData.contents).events[0].message.text;
    var cache = CacheService.getScriptCache();
    var type = cache.get("type");
    var helpMessage = `まず、今回のプロジェクトでも、今週の業務でも振り返る対象を決めてください。
    よかった点、改善点と思う事を挙げ出していきます。\n
    この際、当初の計画があれば、それと比較して、結果がどうだったか、なぜその結果となったかを考えると、自ずと良し悪しが見えます。
    その次に、良かった点、改善点を踏まえて次に何をすべきを考えます。\n
    よかった点を、よりよくするためには何ができるか？あるいは、継続する仕組み、仕掛けが構築できないか？自身だけでやっていたことをチームに拡張できないか？見てみてください。
    改善点に対しては、どうすれば改善できるか？何が原因でうまくいかなかったか、それを解消するための仕組みや仕掛けが構築できないか？チームとしての仕掛けで解消できないか？見てみてください。
    ちなみに、自身の成長のためには、改善点を潰していくというProblemとTryに集中してしまうかもしれませんが、モチベーションの維持や、自分の強みをさらに強化させて尖らせていくという意味では、Keepも確り上げ出しましょう。\n
    逆に、どちらかしか出ていないというのは、まだ挙げ出す余地があると思って良いでしょう。\nKPTは、「計画に対して、良かった点、悪かった点を挙げ出して、次の行動に活かす」という一連の流れを踏んでいます。`
    if (type === null) {
      if (userMessage === "良かった点") {
        cache.put("type", 1);
        reply(replyToken, "今日の良かった点を教えてください");
      } else if (userMessage === "ヘルプ") {
        reply(replyToken, helpMessage);
        cache.put("type", 2);
      } else {
        reply(replyToken, "リッチメニュー");
      }
    } else {
      if (userMessage === "キャンセル") {
        cache.remove("type");
        reply(replyToken, "キャンセルしました！");
        return;
      }
  
      switch(type) {
        case "1":
          // 良かった点
          cache.put("type", 2);
          cache.put("good_message",userMessage)
          // 良かった点をキャッシュしておく
          const goodMessage = `良かった点は\n${userMessage}\nですね？\n 次に悪かった点を入力してください。`
          reply(replyToken, goodMessage);
          break;
  
        case "2":
            // 悪かった点
            cache.put("type", 3);
            const badMessage = `悪かった点は\n${userMessage}\nですね？\n次に良かった点、改善点を踏まえて次に何をすべきかを入力してください。`
            // 悪かった点をキャッシュしておく 　
            cache.put("bad_message",userMessage)
            reply(replyToken, badMessage);
            break;
        case "3":
          // つぎやること
          cache.put("type", 4);
          const tryMessage = `次に何をすべきかの点は\n${userMessage}\nですね？。`
          // 悪かった点をキャッシュしておく 　
          cache.put("try_message",userMessage)
          reply(replyToken, tryMessage);
          break;
        case "4":
          //TODO: はい、いいえが記述されたカードテンプレーとを送信するようにしたい。
          // 最終確認
          cache.remove("type");
          if (userMessage === "はい") {
            // TODO: spreadsheetに追加する
            addSpreadSheet(cache)
            reply(replyToken, "追加しました！\nお疲れ様でした！");
          } else {
            reply(replyToken, "もう一度最初からやり直してください。");
          }
          break;
        default:
          reply(replyToken, "やり直してください。!");
          break;
      }
    }
  }


function reply(replyToken, message) {
    var url = "https://api.line.me/v2/bot/message/reply";
    UrlFetchApp.fetch(url, {
      "headers": {
        "Content-Type": "application/json; charset=UTF-8",
        "Authorization": "Bearer " + ACCESS_TOKEN,
      },
      "method": "post",
      "payload": JSON.stringify({
        "replyToken": replyToken,
        "messages": [{
          "type": "text",
          "text": message,
        }],
      }),
    });
    return ContentService.createTextOutput(JSON.stringify({"content": "post ok"})).setMimeType(ContentService.MimeType.JSON);
  }

function addSpreadSheet(cache) {
    var date = new Date();
    const message = [
        // 日付, 良かった点, 悪かった点
        [date, cache.get("good_message"),cache.get("bad_message"),cache.get("try_message")]
    ]
    var SHEET_ID = '__SHEET_ID__'
    var spreadSheet = SpreadsheetApp.openById(SHEET_ID);
    var sheet = spreadSheet.getSheets()[0];
    // そのシート上の値が存在するセル範囲を取得
    var range = sheet.getDataRange();
    // そのセル範囲にある値の多次元配列を取得
    var values = range.getValues();
    console.log(values.length)
    const row = values.length + 1
    const column = 1
    const numRows = 1
    const numColumns = 4
    sheet.getRange(row, column, numRows, numColumns).setValues(message);
}

//送信するメッセージ定義する関数を作成します。
function createMessage() {
    //メッセージを定義する
    message = "今日のreflactionを行ってください。";
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
      var pushMessages = [
        {
          "type": "template",
          "altText": "今日のリフレクションを行ってください。\nhttps://liff.line.me/1655805037-4r2doKn1",
          "template": {
              "type": "buttons",
              "thumbnailImageUrl": "https://example.com/bot/images/image.jpg",
              "imageAspectRatio": "rectangle",
              "imageSize": "cover",
              "imageBackgroundColor": "#FFFFFF",
              "title": "リフレクション",
              "text": "今日一日のリフレクションを行ってください。",
              "defaultAction": {
                  "type": "uri",
                  "label": "View detail",
                  "uri": "https://liff.line.me/1655805037-4r2doKn1"
              },
              "actions": [
                  {
                    "type": "uri",
                    "label": "リフレクション開始",
                    "uri": "https://liff.line.me/1655805037-4r2doKn1"
                  }
              ]
          }
        },
        {
          'type':'text',
          'text':"https://liff.line.me/1655805037-4r2doKn1",
        }]
      //toのところにメッセージを送信したいユーザーのIDを指定します。(toは最初の方で自分のIDを指定したので、linebotから自分に送信されることになります。)
      //textの部分は、送信されるメッセージが入ります。createMessageという関数で定義したメッセージがここに入ります。
      // var postData = {
      //   "to" : USER_ID,
      //   "messages" : [
      //     {
      //       'type':'text',
      //       'text':text,
      //     }
      //   ]
      // };
      
      var postData = {
        "to" : USER_ID,
        "messages" : buttonTemplate
      };
    
      var options = {
        "method" : "post",
        "headers" : headers,
        "payload" : JSON.stringify(postData)
      };
    
      return UrlFetchApp.fetch(url, options);
    }