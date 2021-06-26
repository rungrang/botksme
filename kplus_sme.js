const wdio = require("webdriverio");
const assert = require("assert");
const mysql = require('mysql');
const log = require("log");
var multer = require('multer');
var upload = multer({ dest: 'uploads/' });
var multerS3 = require('multer-s3');
const AWS = require('aws-sdk');
const bucket = 'slipwithdrawBranchAAM';
const uploadFolder = './uploads/';
const fs = require('fs');
var request = require('request');
var path = require('path');
var LineAPI = require('line-api');
const admin = require("firebase-admin");
var serviceAccount = require("./firebase.json");
let kue = require('kue');
let queue = kue.createQueue();


 
const databaseHost = '';
const databaseUser = '';
const databasePassword = '';
const databaseName = '';

queue.setMaxListeners(200);
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
const notify = new LineAPI.Notify({
    // token: "UcMY4UDvwl9CrGjCiQjf345niZe3xRnRKIVce8Wot4a"
    token : "N75bt4MkEoifRtyzG58H5Iyvhn3myAlsEAglY0pCymv"
})

AWS.config.update({
    accessKeyId: 'AKIAVAJLSY77WM4CAOSP',
    secretAccessKey: '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',
    region: 'ap-southeast-1'
});

  var s3 = new AWS.S3({
  credentials: {
    accessKeyId: 'AKIAVAJLSY77WM4CAOSP',
    secretAccessKey: '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',
    region: 'ap-southeast-1'
  }
  });


const opts = {
  port: 4723,
  capabilities: {
    platformName: "Android",
    platformVersion: "10",
    deviceName: "Android",
    // app: "/home/osboxes/client-appium/ApiDemos.apk",
    // appPackage: "io.appium.android.apis",
    appPackage: "com.kasikorn.sme.mbanking",
    // appActivity: "com.kasikorn.retail.mbanking.kplus.transfer.activity.TransferPromptPayActivity",
    // appActivity: "com.kasikorn.retail.mbanking.kplus.onboard.activity.OnBoardActivity",
    // appActivity:"com.kasikorn.retail.mbanking.kplus.home.activity.SplashScreenActivity",
    appActivity:"com.kbank.kmbsme.ksme.app.SplashScreenActivity",
    appWaitActivity:"*",
    automationName: "UiAutomator2",
    autoGrantPermissions: true,
    noReset: true
  }
};
function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
});
}


const uploadFile = (fp, k) => {

  console.log('start upload');
  return new Promise((resolve, reject)=> {
    fs.readFile(fp, async function(err, data, filePath = fp, key = k) {
      if (err) console.error(err);

      var base64data = new Buffer(data, 'binary');
      var params = {
        Bucket: 'slipwithdrawBranchAAM',
        Key: key,
        Body: base64data,
        ACL: 'public-read',
        ContentType: 'image/jpeg'      
      };
      console.log(params);
      s3.upload(params, (err, data) => {
        if (err) console.error(`Upload Error ${err}`);
        console.log('Upload Completed');
          console.log(err, data);
          resolve(data.Location);
      });
    });
  });
};

// var location = uploadFile(uploadFolder+'360808349122.png', '360808349122.png');

// const downloadFile = (filePath, bucketName, key) => {
//   const params = {
//     Bucket: bucketName,
//     Key: key
//   };
//   console.log('here');
//   s3.getObject(params, (err, data) => {
//     console.log('here');
//     if (err) console.error(err);
//     fs.writeFileSync(filePath, data.Body.toString());
//     console.log(`${filePath} has been created!`);
//   });
// };

// downloadFile('./dddd.png', 'kyc-likepoint', '1555472505403Selection_156.png');


async function kplus_sme_promptpay(running, authorized, status, accountNumber, baht, typePay, phoneNumber){
  try{
     var con = mysql.createConnection({
      host     : databaseHost,
      user     : databaseUser,
      password : databasePassword,
      database : databaseName
    });   
    con.query("UPDATE BCT_kbank_thai_withdraw SET authorized = ? , kb_status = ? WHERE running = ?", [authorized, 2, running], async  (err, result) => {
            if (err) {
               con.end();
              log('error running id : '+ running);
              await sleep(10000);
              return resolve(kplus_sme_promptpay(running, authorized, status, accountNumber, baht, typePay, phoneNumber));
            }

            if (result) {
                con.end();
                const client = await wdio.remote(opts);
                  await sleep(5000);
                const openApp = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/buttonSignIn")');
                await openApp.click();    
                await sleep(5000);
                const click_pin_1 = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/buttonPinDigits_1")');
                await click_pin_1.click();   
                const click_pin_2 = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/buttonPinDigits_5")');
                await click_pin_2.click();    

                const click_pin_3 = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/buttonPinDigits_1")');
                await click_pin_3.click();   
                const click_pin_4 = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/buttonPinDigits_5")');
                await click_pin_4.click();

                const click_pin_5 = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/buttonPinDigits_1")');
                await click_pin_5.click();   
                const click_pin_6 = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/buttonPinDigits_5")');
                await click_pin_6.click();    

                const tranfser = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/imageViewTabTransfer")');
                await tranfser.click();

                const new_transfer = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/buttonNewTransFerList")');
                await new_transfer.click();

                const transfer_promptpay = await client.$('android=new UiSelector().text("รหัสพร้อมเพย์")');
                await transfer_promptpay.click();    

                if(typePay == 'phoneNumber'){
                  const slide_1 = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/pagerLogoContainer")');
                  await slide_1.touchAction([
                      'press',
                      { action: 'moveTo', x: 150, y: 0 },
                      'release'
                  ])  
                }else{

                }
                
                const transferInput = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/editTextInputNumbAccount")');
                // await transferInput.click();


                const phoneDest = await transferInput.setValue(accountNumber);

                const click_amount = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/editTextInputAmountWithKeyboard")');
                // await click_amount.click();

                const amount = await click_amount.setValue(parseFloat(baht));
                // await transferInput.click();


                const click_transfer = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/buttonTransferFundTransfer")');
                await click_transfer.click();    

                const confirm_transfer = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/buttonFundTransFerConfirm_Confirm")');
                await confirm_transfer.click();

                const saveSlip = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/cardView_fund_transfer_Summary")');
                await saveSlip.saveScreenshot('./uploads/'+running+accountNumber+'.png');

                            
         
              log("success update ");  
              let fileName = running+accountNumber+'.png';
              url_slip = await uploadFile(uploadFolder+fileName, fileName);
                await notify.send({
                    message: "\n\n ทำการโอนเงินไปยัง บัญชี :"+ accountNumber + " เรียบร้อยแล้ว \n\n "+ "URL : "+ url_slip,
                    image: './uploads/'+fileName // local file
                     // image: { thumbnail: 'http://example.com/240x240.jpg' } // remote url
                });

                 await updateStatus(running, url_slip);
                 await sentFCM(phoneNumber, baht, 'THB');
                 await client.deleteSession();
                 return true;  
                }    
             }); 
      
  }catch(e){
      console.log(e);
      log("failed transfer "+ e + 'running :'+ running); 
      await sleep(2000);
      return false;
    }
}


// test_swipe();
async function test_swipe(){
      const client = await wdio.remote(opts);
                  await sleep(3000);
                const openApp = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/buttonSignIn")');
                await openApp.click();    
                await sleep(5000);
                const click_pin_1 = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/buttonPinDigits_1")');
                await click_pin_1.click();   
                const click_pin_2 = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/buttonPinDigits_5")');
                await click_pin_2.click();    

                const click_pin_3 = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/buttonPinDigits_1")');
                await click_pin_3.click();   
                const click_pin_4 = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/buttonPinDigits_5")');
                await click_pin_4.click();

                const click_pin_5 = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/buttonPinDigits_1")');
                await click_pin_5.click();   
                const click_pin_6 = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/buttonPinDigits_5")');
                await click_pin_6.click();    

                const tranfser = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/imageViewTabTransfer")');
                await tranfser.click();

                const new_transfer = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/buttonNewTransFerList")');
                await new_transfer.click();
                  const slide_1 = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/pagerLogoContainer")');
                  await slide_1.touchAction([
                     { action: 'press', x: 900, y: 50},
                      { action: 'wait', ms: 1000},
                      { action: 'moveTo', x: 5, y: 50 },
                      'release'
                  ])    
          
}
//5bank
function kplus_sme_bank(running, authorized, status, accountNumber, baht, typePay, phoneNumber){
  return new Promise(async (resolve ,reject) =>{
  try{
     var con = mysql.createConnection({
      host     : databaseHost,
      user     : databaseUser,
      password : databasePassword,
      database : databaseName
    });   
    con.query("UPDATE BCT_kbank_thai_withdraw SET authorized = ? , kb_status = ? WHERE running = ?", [authorized, 2, running], async  (err, result) => {
            if (err) {
               con.end();
              log('error running id : '+ running);
              await sleep(10000);
              return resolve(kplus_sme_bank(running, authorized, status, accountNumber, baht, typePay, phoneNumber));
            }
            if (result) {
                con.end();
                const client = await wdio.remote(opts);
                  await sleep(3000);
                const openApp = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/buttonSignIn")');
                await openApp.click();    
                await sleep(3000);
                const click_pin_1 = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/buttonPinDigits_1")');
                await click_pin_1.click();   
                const click_pin_2 = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/buttonPinDigits_5")');
                await click_pin_2.click();    

                const click_pin_3 = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/buttonPinDigits_1")');
                await click_pin_3.click();   
                const click_pin_4 = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/buttonPinDigits_5")');
                await click_pin_4.click();

                const click_pin_5 = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/buttonPinDigits_1")');
                await click_pin_5.click();   
                const click_pin_6 = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/buttonPinDigits_5")');
                await click_pin_6.click();    

                const tranfser = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/imageViewTabTransfer")');
                await tranfser.click();

                const new_transfer = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/buttonNewTransFerList")');
                await new_transfer.click();

                if(typePay == 'KRUNGSRI-BANK'){
                  const slide_1 = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/pagerLogoContainer")');
                  await slide_1.touchAction([
                      { action: 'press', x: 5, y: 50},
                      { action: 'wait', ms: 1000},
                      { action: 'moveTo', x: 600, y: 50 },
                      'release'
                  ])  
                    try{
                       const checkBank = await client.$('android=new UiSelector().text("กรุงศรี")'); 
                       console.log(checkBank.error);
                    } catch(e){
                     console.log(e);
                     await notify.send({
                        message: "\n\n หาธนาคารไม่เจอ เคส "+ running+ " \n" + accountNumber+ "\n "+ typePay 
                         // image: { thumbnail: 'http://example.com/240x240.jpg' } // remote url
                    });                    
                  }           
            

                }else if( typePay == 'BANGKOK-BANK'){
                   const slide_1 = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/pagerLogoContainer")');
                  await slide_1.touchAction([
                      { action: 'press', x: 5, y: 50},
                      { action: 'wait', ms: 1000},
                      { action: 'moveTo', x: 300, y: 50 },
                      'release'
                  ])  
                    try{
                       const checkBank = await client.$('android=new UiSelector().text("กรุงเทพ")'); 
                       console.log(checkBank.error);
                    } catch(e){
                     console.log(e);
                     await notify.send({
                        message: "\n\n หาธนาคารไม่เจอ เคส "+ running+ " \n" + accountNumber+ "\n "+ typePay 
                         // image: { thumbnail: 'http://example.com/240x240.jpg' } // remote url
                    });                    
                  }                     
                }else if( typePay == 'KRUNGTHAI-BANK'){
                   const slide_1 = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/pagerLogoContainer")');
                  await slide_1.touchAction([
                      { action: 'press', x: 600, y: 50},
                      { action: 'wait', ms: 1000},
                      { action: 'moveTo', x: 5, y: 50 },
                      'release'
                  ])  
                    try{
                       const checkBank = await client.$('android=new UiSelector().text("กรุงไทย")'); 
                       console.log(checkBank.error);
                    } catch(e){
                     console.log(e);
                     await notify.send({
                        message: "\n\n หาธนาคารไม่เจอ เคส "+ running+ " \n" + accountNumber+ "\n "+ typePay 
                         // image: { thumbnail: 'http://example.com/240x240.jpg' } // remote url
                    });                    
                  }                     
                }else if( typePay == 'TMB-BANK'){
                   const slide_1 = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/pagerLogoContainer")');
                  await slide_1.touchAction([
                       { action: 'press', x: 900, y: 50},
                      { action: 'wait', ms: 1000},
                      { action: 'moveTo', x: 5, y: 50 },
                      'release'
                  ])  
                    try{
                       const checkBank = await client.$('android=new UiSelector().text("ทหารไทย")'); 
                       console.log(checkBank.error);
                    } catch(e){
                     console.log(e);
                     await notify.send({
                        message: "\n\n หาธนาคารไม่เจอ เคส "+ running+ " \n" + accountNumber+ "\n "+ typePay 
                         // image: { thumbnail: 'http://example.com/240x240.jpg' } // remote url
                    });                    
                  }                     
                }else if( typePay == 'SCB-BANK'){
                   const slide_1 = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/pagerLogoContainer")');
                  await slide_1.touchAction([
                       { action: 'press', x: 300, y: 50},
                      { action: 'wait', ms: 1000},
                      { action: 'moveTo', x: 5, y: 50 },
                      'release'
                  ])  
                    try{
                       const checkBank = await client.$('android=new UiSelector().text("ไทยพาณิชย์")'); 
                       console.log(checkBank.error);
                    } catch(e){
                     console.log(e);
                     await notify.send({
                        message: "\n\n หาธนาคารไม่เจอ เคส "+ running+ " \n" + accountNumber+ "\n "+ typePay 
                         // image: { thumbnail: 'http://example.com/240x240.jpg' } // remote url
                    });                    
                  }                     
                }else if( typePay == 'THANACHART-BANK'){
                   const slide_1 = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/pagerLogoContainer")');
                  await slide_1.touchAction([
                       { action: 'press', x:900, y: 50},
                      { action: 'wait', ms: 1000},
                      { action: 'moveTo', x: 5, y: 50 },
                      'release'
                  ])  
                  await slide_1.touchAction([
                       { action: 'press', x:600, y: 50},
                      { action: 'wait', ms: 1000},
                      { action: 'moveTo', x: 5, y: 50 },
                      'release'
                  ]) 
                    try{
                       const checkBank = await client.$('android=new UiSelector().text("ธนชาต")'); 
                       console.log(checkBank.error);
                    } catch(e){
                     console.log(e);
                     await notify.send({
                        message: "\n\n หาธนาคารไม่เจอ เคส "+ running+ " \n" + accountNumber+ "\n "+ typePay 
                         // image: { thumbnail: 'http://example.com/240x240.jpg' } // remote url
                    });                    
                  }                     
                }else if( typePay == 'GSB-BANK'){
                   const slide_1 = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/pagerLogoContainer")');
                  await slide_1.touchAction([
                       { action: 'press', x: 900, y: 50},
                      { action: 'wait', ms: 1000},
                      { action: 'moveTo', x: 5, y: 50 },
                      'release'
                  ]) 
                  await slide_1.touchAction([
                       { action: 'press', x: 900, y: 50},
                      { action: 'wait', ms: 1000},
                      { action: 'moveTo', x: 5, y: 50 },
                      'release'
                  ]) 
                  await slide_1.touchAction([
                       { action: 'press', x: 600, y: 50},
                      { action: 'wait', ms: 1000},
                      { action: 'moveTo', x: 5, y: 50 },
                      'release'
                  ])                   
                    try{
                       const checkBank = await client.$('android=new UiSelector().text("ออมสิน")'); 
                       console.log(checkBank.error);
                    } catch(e){
                     console.log(e);
                     await notify.send({
                        message: "\n\n หาธนาคารไม่เจอ เคส "+ running+ " \n" + accountNumber+ "\n "+ typePay 
                         // image: { thumbnail: 'http://example.com/240x240.jpg' } // remote url
                    });                    
                  }                     
                }else if( typePay == 'TISCO-BANK'){
                   const slide_1 = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/pagerLogoContainer")');
                  await slide_1.touchAction([
                       { action: 'press', x: 900, y: 50},
                      { action: 'wait', ms: 1000},
                      { action: 'moveTo', x: 5, y: 50 },
                      'release'
                  ])  
                 await slide_1.touchAction([
                       { action: 'press', x: 900, y: 50},
                      { action: 'wait', ms: 1000},
                      { action: 'moveTo', x: 5, y: 50 },
                      'release'
                  ]) 
                    try{
                       const checkBank = await client.$('android=new UiSelector().text("ทิสโก้")'); 
                       console.log(checkBank.error);
                    } catch(e){
                     console.log(e);
                     await notify.send({
                        message: "\n\n หาธนาคารไม่เจอ เคส "+ running+ " \n" + accountNumber+ "\n "+ typePay 
                         // image: { thumbnail: 'http://example.com/240x240.jpg' } // remote url
                    });                    
                  }                     
                }else if( typePay == 'KAITNAKIN-BANK'){
                   const slide_1 = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/pagerLogoContainer")');
                  await slide_1.touchAction([
                       { action: 'press', x: 900, y: 50},
                      { action: 'wait', ms: 1000},
                      { action: 'moveTo', x: 5, y: 50 },
                      'release'
                  ])  
                  await slide_1.touchAction([
                       { action: 'press', x: 900, y: 50},
                      { action: 'wait', ms: 1000},
                      { action: 'moveTo', x: 5, y: 50 },
                      'release'
                  ])  
                   await slide_1.touchAction([
                       { action: 'press', x: 900, y: 50},
                      { action: 'wait', ms: 1000},
                      { action: 'moveTo', x: 5, y: 50 },
                      'release'
                  ])  
                  await slide_1.touchAction([
                       { action: 'press', x: 300, y: 50},
                      { action: 'wait', ms: 1000},
                      { action: 'moveTo', x: 5, y: 50 },
                      'release'
                  ])                                     

                    try{
                       const checkBank = await client.$('android=new UiSelector().text("เกียรตินาคินภัทร")'); 
                       console.log(checkBank.error);
                    } catch(e){
                     console.log(e);
                     await notify.send({
                        message: "\n\n หาธนาคารไม่เจอ เคส "+ running+ " \n" + accountNumber+ "\n "+ typePay 
                         // image: { thumbnail: 'http://example.com/240x240.jpg' } // remote url
                    });                    
                  }                     
                }
                const transferInput = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/editTextInputNumbAccount")');
                // await transferInput.click();


                const phoneDest = await transferInput.setValue(accountNumber);

                const click_amount = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/editTextInputAmountWithKeyboard")');
                // await click_amount.click();

                const amount = await click_amount.setValue(parseFloat(baht));
                // await transferInput.click();


                const click_transfer = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/buttonTransferFundTransfer")');
                await click_transfer.click();    

                const confirm_transfer = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/buttonFundTransFerConfirm_Confirm")');
                await confirm_transfer.click();

                const saveSlip = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/cardView_fund_transfer_Summary")');
                await saveSlip.saveScreenshot('./uploads/'+running+accountNumber+'.png');

                            
         
              log("success update ");  
              let fileName = running+accountNumber+'.png';
              url_slip = await uploadFile(uploadFolder+fileName, fileName);
                await notify.send({
                    message: "\n\n ทำการโอนเงินไปยัง บัญชี :"+ accountNumber + " เรียบร้อยแล้ว \n\n "+ "URL : "+ url_slip,
                    image: './uploads/'+fileName // local file
                     // image: { thumbnail: 'http://example.com/240x240.jpg' } // remote url
                });

                 await updateStatus(running, url_slip);
                 await sentFCM(phoneNumber, baht, 'THB');
                 await client.deleteSession();
                 // return true;
                 resolve(true);  
                }    
             }); 
      
  } catch (e) {

      await notify.send({
          message: "\n\n หาธนาคารไม่เจอ เคส "+ running+ " \n" + accountNumber+ "\n "+ typePay 
           // image: { thumbnail: 'http://example.com/240x240.jpg' } // remote url
      });     
      console.log(e);
      log("failed transfer "+ e + 'running :'+ running); 
      await sleep(2000);
      // return false;
      reject();
    }

    })
}


async function updateStatus(running, slip) {
  return new Promise((resolve, reject) => {
     var con = mysql.createConnection({
      host     : databaseHost,
      user     : databaseUser,
      password : databasePassword,
      database : databaseName
    });      
         con.query("UPDATE BCT_kbank_thai_withdraw SET kb_slip = ?, kb_status = ?, update_user = ? , create_user = ? WHERE running = ?", [slip, 3, 'paymentapi@prachakij.com', 'paymentapi@prachakij.com', running], async function (err,result) {
                     if (err) {
                       con.end();
                       console.log(err);
                        log('error running id : '+ running);
                        await sleep(10000);
                        return resolve(updateStatus(con, running));
                     } 
                    //  request
                    //   .get('http://devdev.prachakij.com/liberyRung/outGoing/save_outgoing_by_running.php?running='+ running)
                    //   .on('response', function(response) {
                    //     console.log(response.statusCode) // 200
                    //     console.log(response.headers['content-type']) // 'image/png'
                    //   });  
                      con.end();
                      return resolve();             

         });
  });


}

async function kplus_promtppay (con, running, authorized, status, accountNumber, baht) {
  return new Promise( async(resolv, reject) => {

    try{
    const client = await wdio.remote(opts);
     await sleep(5000);
    // const field = await client.$('android=new UiSelector().resourceId("com.kasikorn.retail.mbanking.wap:id/text_quick_balance_name")');
    const openApp = await client.$('android=new UiSelector().resourceId("com.kasikorn.retail.mbanking.wap:id/footer_bank_imagebutton")');
    await openApp.click();
    const click_1 = await client.$('android=new UiSelector().resourceId("com.kasikorn.retail.mbanking.wap:id/button_1")');
    await click_1.click();  

    const click_2 = await client.$('android=new UiSelector().resourceId("com.kasikorn.retail.mbanking.wap:id/button_9")');
    await click_2.click();

    const click_3 = await client.$('android=new UiSelector().resourceId("com.kasikorn.retail.mbanking.wap:id/button_9")');
    await click_3.click();

    const click_4 = await client.$('android=new UiSelector().resourceId("com.kasikorn.retail.mbanking.wap:id/button_2")');
    await click_4.click();

    const click_5 = await client.$('android=new UiSelector().resourceId("com.kasikorn.retail.mbanking.wap:id/button_1")');
    await click_5.click();

    const click_6 = await client.$('android=new UiSelector().resourceId("com.kasikorn.retail.mbanking.wap:id/button_9")');
    await click_6.click();

    const transfer = await client.$('android=new UiSelector().text("โอนเงิน")');
    await transfer.click();

    const promptpay = await client.$('android=new UiSelector().text("พร้อมเพย์")');
    await promptpay.click();

    // const transferInput = await client.$('android.widget.EditText');
    const transferInput = await client.$('android=new UiSelector().text("ระบุเบอร์มือถือ/เลขบัตรประชาชน/เลขประจำตัวผู้เสียภาษี")');
    console.log(transferInput);
    await transferInput.click();
    const phoneDest = await transferInput.setValue(accountNumber);

    const outFocus = await client.$('android=new UiSelector().text("ไปยัง:")');
    await outFocus.click();

    const amountZ = await client.$('android=new UiSelector().text("0.00")');
    await amountZ.click();
    const amount = await amountZ.setValue(parseFloat(baht));
    await outFocus.click();
    // if(phoneDest == '0818657689'){
    //     assert.equal(phoneDest,"0818657689");

   
    //     if(amount == 1){
    //        assert.equal(amount,1);

    //     }
    // }
    const nextSend = await client.$('android=new UiSelector().resourceId("com.kasikorn.retail.mbanking.wap:id/imageview_navigation_next")');
    await nextSend.click();  

    const confirmSend = await client.$('android=new UiSelector().resourceId("com.kasikorn.retail.mbanking.wap:id/linearlayout_navigation_next")');
    await confirmSend.click();
    const saveSlip = await client.$('android=new UiSelector().resourceId("com.kasikorn.retail.mbanking.wap:id/imageView_slip_background")');
    await saveSlip.saveScreenshot('./uploads/'+running+accountNumber+'.png');
              con.query("UPDATE BCT_kbank_thai_withdraw SET authorized = ? , kb_status = ? WHERE running = ?", [authorized, 2, running], async function (err, result, fields, fileName=running+accountNumber+'.png', acc = accountNumber, runnings = running) {
                  if (err) {
                          log("running problem "+ err + 'running :'+ runnings); 
                          throw err;
                  }
                  if (result) {
                      console.log(result);  
                      log("success update ");  

                      url_slip = await uploadFile(uploadFolder+fileName, fileName);
                        notify.send({
                            message: "\n\n ทำการโอนเงินไปยัง บัญชี :"+ acc + " เรียบร้อยแล้ว \n\n "+ "URL : "+ url_slip,
                            image: './uploads/'+fileName // local file
                             // image: { thumbnail: 'http://example.com/240x240.jpg' } // remote url
                        }).then(d =>{
                          return true; 
                        })


                  }
              })  
   
   // return true;
    // const value = await field.getText();
    // assert.equal(value,"Hello World!");

    await client.deleteSession();
    }catch(e){
      console.log(e);
      log("failed transfer "+ e + 'running :'+ running); 
      await sleep(2000);
      return false;
    }

  });
}

//เข้าคิวทำงาน
queue.process('transferBankBranchAAM', function(job, done){

  console.log('Working on job withdrawThai branch aam');
  console.log(job.data);

  promptPayWithdraw(done);
});
//ทำทีละรายการ
async function promptPayWithdraw(done) {
      var con = mysql.createConnection({
      host     : databaseHost,
      user     : databaseUser,
      password : databasePassword,
      database : databaseName
    });
      await sleep(3000);
      console.log('prompt start !');
       // await sleep(2000);
       // await kplus_sme_promptpay(con, 1, 1, 1, '0808349122', '1');


        // console.log('success');
        // process.exit();
    ////authorized = 1 and kb_status = 1 for start tranfer but round limit 10 rows per time
    con.connect();
    const sql = "SELECT * FROM BCT_kbank_thai_withdraw WHERE authorized = ? and kb_status = ? ORDER BY running LIMIT 10";
    con.query(sql, [1, 1], async  (err, result, fields) => {
      if (err) {
         con.end()
           done();

        console.log(err);
        log('selectMysql : '+ err);

      }else{
        con.end()
        if(result.length == 0){
          console.log('0 record');
        }

          let typePay;
          //วนรายการ สูงสุด 10 รายการต่อรอบ
        for(let i=0; i<result.length;i++){
          if(result[i].bankName == 'promptpay'){
            if(result[i].accountNumber.length == 13){
              typePay = 'idCard';
            }else{
              typePay = 'phoneNumber'
            }

            let detail = await kplus_sme_promptpay(result[i].running, result[i].authorized, result[i].status, result[i].accountNumber, result[i].baht, typePay, result[i].phoneNumber);
            console.log(detail);          
          }else if(result[i].bankName == 'KASIKORN-BANK'){
              typePay = 'KASIKORN-BANK';
             let detail = await kplus_sme_bank(result[i].running, result[i].authorized, result[i].status, result[i].accountNumber, result[i].baht, typePay, result[i].phoneNumber);
              console.log(detail);  
          }else if(result[i].bankName == 'KRUNGSRI-BANK'){
              typePay = 'KRUNGSRI-BANK';
               let detail = await kplus_sme_bank(result[i].running, result[i].authorized, result[i].status, result[i].accountNumber, result[i].baht, typePay, result[i].phoneNumber);
              console.log(detail);            
          }else if(result[i].bankName == 'BANGKOK-BANK'){
              typePay = 'BANGKOK-BANK';
               let detail = await kplus_sme_bank(result[i].running, result[i].authorized, result[i].status, result[i].accountNumber, result[i].baht, typePay, result[i].phoneNumber);
              console.log(detail);            
          }else if(result[i].bankName == 'KRUNGTHAI-BANK'){
              typePay = 'KRUNGTHAI-BANK';
               let detail = await kplus_sme_bank(result[i].running, result[i].authorized, result[i].status, result[i].accountNumber, result[i].baht, typePay, result[i].phoneNumber);
              console.log(detail);            
          }else if(result[i].bankName == 'TMB-BANK'){
              typePay = 'TMB-BANK';
               let detail = await kplus_sme_bank(result[i].running, result[i].authorized, result[i].status, result[i].accountNumber, result[i].baht, typePay, result[i].phoneNumber);
              console.log(detail);            
          }else if(result[i].bankName == 'SCB-BANK'){
              typePay = 'SCB-BANK';
               let detail = await kplus_sme_bank(result[i].running, result[i].authorized, result[i].status, result[i].accountNumber, result[i].baht, typePay, result[i].phoneNumber);
              console.log(detail);            
          }else if(result[i].bankName == 'THANACHART-BANK'){
              typePay = 'THANACHART-BANK';
               let detail = await kplus_sme_bank(result[i].running, result[i].authorized, result[i].status, result[i].accountNumber, result[i].baht, typePay, result[i].phoneNumber);
              console.log(detail);            
          }else if(result[i].bankName == 'GSB-BANK'){
              typePay = 'GSB-BANK';
               let detail = await kplus_sme_bank(result[i].running, result[i].authorized, result[i].status, result[i].accountNumber, result[i].baht, typePay, result[i].phoneNumber);
              console.log(detail);            
          }else if(result[i].bankName == 'TISCO-BANK'){
              typePay = 'TISCO-BANK';
               let detail = await kplus_sme_bank(result[i].running, result[i].authorized, result[i].status, result[i].accountNumber, result[i].baht, typePay, result[i].phoneNumber);
              console.log(detail);            
          }else if(result[i].bankName == 'KAITNAKIN-BANK'){
              typePay = 'KAITNAKIN-BANK';
               let detail = await kplus_sme_bank(result[i].running, result[i].authorized, result[i].status, result[i].accountNumber, result[i].baht, typePay, result[i].phoneNumber);
              console.log(detail);            
          }

        }
       
       console.log('no done');
          done();

      
        console.log('success');
        // process.exit();
      }
  });
}



async function sentFCM(phoneNumber, amount, currency) {
    // This registration token comes from the client FCM SDKs.
   
   return new Promise((resolve, reject)=>{
     const db = admin.firestore();
        let user = db.collection('addressDNS');
        user.where('phoneNumber', '==', phoneNumber).get().then(snapshot => {
            if (snapshot != null) {
                if (snapshot.exists) {
                     //exists
                } else {
                     //doesn't exist
                     resolve(true);
                }
            } 
            snapshot.forEach(doc => {

                console.log(doc.id, '=>', doc.data());
                var registrationToken = doc.data().FCMtoken;

                var map = new Map();
                map.set('th', 'ได้รับเงินโอน ');
                map.set('en', 'You receive  ');
                map.set('lo', 'ທ່ານໄດ້ຮັບ ');
                map.set('km', 'អ្នកទទួលបានចំណុច ');
                map.set('vi', 'Bạn nhận được điểm ');

                var message = {
                    notification: {
                        title: 'LikeWallet',
                        body: map.get(doc.data().locale == null ? 'en' : doc.data().locale) + amount.toString() + ' ' + currency
                    },
                    data: {
                        point: amount.toString(),
                        status: 'true'
                    },
                    token: registrationToken
                };

                // Send a message to the device corresponding to the provided
                // registration token.
                admin.messaging().send(message)
                    .then((response) => {
                        // Response is a message ID string.
                        resolve(true);
                        console.log('Successfully sent message:', response);
                    })
                    .catch((error) => {
                      resolve(true);
                        console.log('Error sending message:', error);
                    });
            });

        });
   });
}