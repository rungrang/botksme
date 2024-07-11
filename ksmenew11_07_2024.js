  const wdio = require("webdriverio");
  const assert = require("assert");
  const mysql = require('mysql');
  const log = require("log");
  var multer = require('multer');
  var upload = multer({ dest: 'uploads/' });
  var multerS3 = require('multer-s3');
  const AWS = require('aws-sdk');
  const bucket = 'slipwithdraw';
  const uploadFolder = './uploads/';
  const fs = require('fs');
  var request = require('request');
  var path = require('path');
  var LineAPI = require('line-api');
  const admin = require("firebase-admin");
  const fetch = require('node-fetch');
  //var serviceAccount = require("./firebase.json");
  let kue = require('kue');
  let queue = kue.createQueue();


  
  const databaseHost = 'pvpserver.ccyc97kggqqv.ap-southeast-1.rds.amazonaws.com';
  const databaseUser = 'bitbooks';
  const databasePassword = 'xxxxxxxxxxxxxxx';
  const databaseName = 'BCT_ACC';

  queue.setMaxListeners(200);
  //admin.initializeApp({
    //  credential: admin.credential.cert(serviceAccount)
  //});

  //////การเงิน ค่าใช้จ่าย ข้อกู้ จัดผ่อน
  const notify = new LineAPI.Notify({
      token : "j2q2q2Bk2emT8HCpjOV7xiXUJPbna1UzKKSFB0ANVx9"
  });

  const notify_dpl = new LineAPI.Notify({
    token : "o9ZelsjXyvODKsPtC8cUkkqY6yB5HGXCcwGVjMORTrg"
  });

  const tokenTG_dpl = "-1001614019433";




  AWS.config.update({
      accessKeyId: 'xxxxxxxxxxxxxxxxxxxxxxx',
      secretAccessKey: 'xxxxxxxxxxxxxxxxxxxxxxx',
      region: 'ap-southeast-1'
  });

    var s3 = new AWS.S3({
    credentials: {
      accessKeyId: 'xxxxxxxxxxxxxxxxxxxxxxxx',
      secretAccessKey: 'xxxxxxxxxxxxxxxxxxxxxxxxx',
      region: 'ap-southeast-1'
    }
    });


  const opts = {
    port: 4723,
    capabilities: {
      platformName: "Android",
      platformVersion: "10",
      deviceName: "Android",
      appPackage: "com.kasikorn.sme.mbanking",
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
          Bucket: 'slipwithdraw',
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
                    await sleep(6000);
                  const openApp = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/buttonSignIn")');
                  await openApp.click();    
                  await sleep(5000);
                  const click_pin_1 = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/buttonPinDigits_4")');
                  await click_pin_1.click();   
                  const click_pin_2 = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/buttonPinDigits_6")');
                  await click_pin_2.click();    

                  const click_pin_3 = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/buttonPinDigits_9")');
                  await click_pin_3.click();   
                  const click_pin_4 = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/buttonPinDigits_6")');
                  await click_pin_4.click();

                  const click_pin_5 = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/buttonPinDigits_8")');
                  await click_pin_5.click();   
                  const click_pin_6 = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/buttonPinDigits_6")');
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
                  await saveSlip.saveScreenshot('./uploads/'+running+accountNumber+'_AAM.png');

                              
          
                log("success update ");  
                let fileName = running+accountNumber+'_AAM.png';
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
  // kplus_sme_bank(3482, 1, 1, '0000000000', 0, "ABBC-BANK", "000000000",3782,"FIN-Center");
  textApp();
  // console.log("เข้า");
  async function textApp(){

  const optsKbank = {
    port: 4723,
    capabilities: {
      platformName: "Android",
      platformVersion: "11",
      deviceName: "Android",
      appPackage: "com.kasikorn.retail.mbanking.wap",
      appActivity:"com.kasikorn.retail.mbanking.kplus.home.activity.SplashScreenActivity",
      appWaitActivity:"*",
      automationName: "UiAutomator2",
      autoGrantPermissions: true,
      noReset: true,
      newCommandTimeout: 300
    }
  };
  const client = await wdio.remote(optsKbank);
  await sleep(5000);
  var kbankXpath = '//android.widget.TextView[@resource-id="com.kasikorn.retail.mbanking.wap:id/footer_bank_textview"]';
  var tranferBtn = await client.$(kbankXpath);

  await tranferBtn.click();
  await sleep(3000);

  var password = "260224";
  for(var i=0;i<6;i++){
    // search btn by text password[i]

    var pin = await client.$('android=new UiSelector().text("'+password[i]+'")');
    // await sleep(1000);
    await pin.click();

  }
  await sleep(3000);
  var xpathTranMenu = '(//android.widget.ImageView[@resource-id="com.kasikorn.retail.mbanking.wap:id/imageMenu"])[1]';
  var tranMenu = await client.$(xpathTranMenu);
  await tranMenu.click();

  ///ธนาคารอื่น
  var xpathOtherBank = '(//android.view.ViewGroup[@resource-id="com.kasikorn.retail.mbanking.wap:id/layout_fundtransfer"])[2]';
  var otherBank = await client.$(xpathOtherBank);
  await otherBank.click();
  await sleep(3000);

  ///ค้นหา Textbox
  var idSearch = 'com.kasikorn.retail.mbanking.wap:id/search_edit_text';
  var search = await client.$('android=new UiSelector().resourceId("'+idSearch+'")');
  //fill

  // var typePay = 'KASIKORN-BANK';
  var jsonConFig = {
    "KASIKORN-BANK" : "กสิกร",
    "KRUNGSRI-BANK" : "กรุงศรี",
    "KRUNGTHAI-BANK" : "กรุงไทย",
    "SCB-BANK" : "ไทยพาณิชย์",
    "BANGKOK-BANK" : "กรุงเทพ",
    "TMB-BANK" : "ทหารไทย",
    "GSB-BANK" : "ออมสิน",
    "TISCO-BANK" : "ทิสโก้",
    "KAITNAKIN-BANK" : "เกียรตินาคินภัทร",
    "ABBC-BANK" : "ออมสิน",
    "CITI-BANK" : "ซิตี้แบงค์",
    "LH-BANK" : "LHBank",
    "UOB-BANK" : "ยูโอบี",
    "SC-BANK" : "สแตนดาร์ด",
    "SCBT" : "สแตนดาร์ด"
  }


  await search.setValue(jsonConFig[typePay]);

  ///get first result
  var bankXpath = '//android.view.ViewGroup[@resource-id="com.kasikorn.retail.mbanking.wap:id/merchant_root"]';
  var bank = await client.$(bankXpath);
  await bank.click();


  // var accountNumber = "4272304713";
  // var baht = 1;
  /////input bank no and amount
  // search place holder คำว่า ระบุเลขบัญชี หรือ กรอกเลขบัญชี
  if(await client.$('android=new UiSelector().text("ระบุเลขบัญชี")')){
    var transferInput =  await client.$('android=new UiSelector().text("ระบุเลขบัญชี")');
  }

  if(await client.$('android=new UiSelector().text("กรอกเลขบัญชี")')){
    var transferInput =  await client.$('android=new UiSelector().text("กรอกเลขบัญชี")');
  }

  //focus
  await transferInput.click();
  await transferInput.setValue(accountNumber);

  // click text ตกลง
  if(await client.$('android=new UiSelector().text("ไปยัง:")')){
    var tranferBtn =  await client.$('android=new UiSelector().text("ไปยัง:")');
    await tranferBtn.click();
  }


  // typing amount
  var allEditText = await client.$$('android.widget.EditText');
  // allEditText[1] = moneyInput
  var moneyInput = allEditText[1]; //กรอกยอดเงิน
  await moneyInput.click();
  await moneyInput.setValue(baht);
  // click text ตกลง

  // click text ตกลง
  if(await client.$('android=new UiSelector().text("ไปยัง:")')){
    var tranferBtn =  await client.$('android=new UiSelector().text("ไปยัง:")');
    await tranferBtn.click();
  }


  await sleep(2000);

  var submitTranfer =  await client.$('android=new UiSelector().text("ต่อไป")');
  await submitTranfer.click();

  try {
    var tranferYes =  await client.$('android=new UiSelector().text("ใช่")');
    await tranferYes.click();
  } catch (errorYes) {
    
  }

  await sleep(3000);

  var submitTranfer =  await client.$('android=new UiSelector().text("ยืนยัน")');
  await submitTranfer.click();


  ///screen shot
  await sleep(10000);
  var id_slip = 'com.kasikorn.retail.mbanking.wap:id/parent_slip_content';
  // var running = "1_1_1";

  var saveSlipKbank = await client.$('android=new UiSelector().resourceId("'+id_slip+'")');
  await saveSlipKbank.saveScreenshot('./uploads/'+running+accountNumber+'_AAM.png');
  await sleep(2000);
  
  
      
      
  }


  function kplus_sme_bank(running, authorized, status, accountNumber, baht, typePay, phoneNumber,kb_out,system_type,kb_ref){

    //console.log("start tranfer");
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
                console.log('error running id : '+ running+" "+err);
                await sleep(5000);
                return resolve(kplus_sme_bank(running, authorized, status, accountNumber, baht, typePay, phoneNumber,kb_out,system_type,kb_ref));
              }
              
              if (result) {
                  con.end();
              //if(1==1){   
                  console.log("111111");
                  const client = await wdio.remote(opts);
                    await sleep(5000);
                    try{
                  const nextF = await client.$('android=new UiSelector().text("Later")');
                  await nextF.click();
                  await sleep(2000);
                  }catch(e){
                  }
                  
                  try{
                  const nextF2 = await client.$('android=new UiSelector().text("ภายหลัง")');
                  await nextF2.click();
                  await sleep(2000);
                  }catch(e){
                  }
                  const openApp = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/buttonSignIn")');
                  await openApp.click();    
                  await sleep(5000);
                  const click_pin_1 = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/buttonPinDigits_1")');
                  await click_pin_1.click();   
                  const click_pin_2 = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/buttonPinDigits_9")');
                  await click_pin_2.click();    

                  const click_pin_3 = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/buttonPinDigits_1")');
                  await click_pin_3.click();   
                  const click_pin_4 = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/buttonPinDigits_9")');
                  await click_pin_4.click();

                  const click_pin_5 = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/buttonPinDigits_1")');
                  await click_pin_5.click();   
                  const click_pin_6 = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/buttonPinDigits_9")');
                  await click_pin_6.click();    
      await sleep(3000);
      
      
      
      
      
                  const tranfser = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/imageViewTabTransfer")');
                  await tranfser.click();
      await sleep(3000);
                  const new_transfer = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/buttonNewTransFerList")');
                  await new_transfer.click();
      console.log("222222");
      await sleep(2000);
      
    
      if(kb_out==3782){
        const click_3782 = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/buttonChangeOrSelectAccount")');
        await click_3782.click();    
                    await sleep(2000);
                    
                  
                    
                    const click2_3782 = await client.$('android=new UiScrollable(new UiSelector().scrollable(true)).scrollIntoView(new UiSelector().resourceIdMatches(".*textViewFundTransfer_no_account1").text("XXX-X-XX378-2"))');
                    await click2_3782.click();    
                    await sleep(1000);
                    
                    
                    
      }else if(kb_out==6303){
        const click_6303 = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/buttonChangeOrSelectAccount")');
        await click_6303.click();    
                    await sleep(2000);
                    
                  
                    
                    const click2_6303 = await client.$('android=new UiScrollable(new UiSelector().scrollable(true)).scrollIntoView(new UiSelector().resourceIdMatches(".*textViewFundTransfer_no_account1").text("XXX-X-XX630-3"))');
                    await click2_6303.click();    
                    await sleep(1000); 
      }else if(kb_out==5943){
        const click_2346 = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/buttonChangeOrSelectAccount")');
        await click_2346.click();    
                    await sleep(2000);
                    
                  
                    
                    const click2_2346 = await client.$('android=new UiScrollable(new UiSelector().scrollable(true)).scrollIntoView(new UiSelector().resourceIdMatches(".*textViewFundTransfer_no_account1").text("XXX-X-XX594-3"))');
                    await click2_2346.click();    
                    await sleep(1000); 
      }
      
      
      
      
      
                  if(typePay == 'KRUNGSRI-BANK'){
                  console.log("33333");          
                    const slide_1 = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/pagerLogoContainer")');
                    
                    var step = 200; //+ถอยหลัง //-เดินหน้า 
                    var n_point = 2; //round
                    for(var pp=0;pp<n_point;pp++){ 
                    
                    await slide_1.touchAction([
                        { action: 'press', x:5, y: 50},
                        { action: 'wait', ms: 1000},
                        { action: 'moveTo', x: step, y: 50 },
                        'release'
                    ])  
                    }
                    
                    
                    
                    
                      try{
                      console.log("444444");
                        const checkBank = await client.$('android=new UiSelector().text("กรุงศรี")'); 
                        console.log(checkBank.error);
                      } catch(e){
                      console.log("55555");
                      console.log(e);
                      if(system_type=="AAM-digital"){
                      await notify_dpl.send({
                          message: "\n\n หาธนาคารไม่เจอ เคส "+ running+ " \n" + accountNumber+ "\n "+ typePay 
                      }); 
                      }else{
                      await notify.send({
                          message: "\n\n หาธนาคารไม่เจอ เคส "+ running+ " \n" + accountNumber+ "\n "+ typePay 
                      });     
                      }

                    }           
              

                  }else if( typePay == 'BANGKOK-BANK'){
                    
                    const slide_1 = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/pagerLogoContainer")');
                    
                    var step = 200; //+ถอยหลัง //-เดินหน้า 
                    var n_point = 1; //round
                    for(var pp=0;pp<n_point;pp++){ 
                    
                    await slide_1.touchAction([
                        { action: 'press', x:5, y: 50},
                        { action: 'wait', ms: 1000},
                        { action: 'moveTo', x: step, y: 50 },
                        'release'
                    ])  
                    }
                      
                      try{
                        const checkBank = await client.$('android=new UiSelector().text("กรุงเทพ")'); 
                        console.log(checkBank.error);
                      } catch(e){
                      console.log(e);
                      if(system_type=="AAM-digital"){
                        await notify_dpl.send({
                          message: "\n\n หาธนาคารไม่เจอ เคส "+ running+ " \n" + accountNumber+ "\n "+ typePay 
                        }); 
                        }else{
                        await notify.send({
                          message: "\n\n หาธนาคารไม่เจอ เคส "+ running+ " \n" + accountNumber+ "\n "+ typePay 
                        });     
                      }                    
                    }                     
                  }else if( typePay == 'KRUNGTHAI-BANK'){
                  const slide_1 = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/pagerLogoContainer")');
                    var step = -200; //+ถอยหลัง //-เดินหน้า 
                    var n_point = 2; //round
                    for(var pp=0;pp<n_point;pp++){ 
                    
                    await slide_1.touchAction([
                        { action: 'press', x:5, y: 50},
                        { action: 'wait', ms: 1000},
                        { action: 'moveTo', x: step, y: 50 },
                        'release'
                    ])  
                    }
                      try{
                        const checkBank = await client.$('android=new UiSelector().text("กรุงไทย")'); 
                        console.log(checkBank.error);
                      } catch(e){
                      console.log(e);
                      if(system_type=="AAM-digital"){
                        await notify_dpl.send({
                          message: "\n\n หาธนาคารไม่เจอ เคส "+ running+ " \n" + accountNumber+ "\n "+ typePay 
                        }); 
                        }else{
                        await notify.send({
                          message: "\n\n หาธนาคารไม่เจอ เคส "+ running+ " \n" + accountNumber+ "\n "+ typePay 
                        });     
                      }                    
                    }                     
                  }else if( typePay == 'TMB-BANK'){
                    const slide_1 = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/pagerLogoContainer")');
                    var step = -200; //+ถอยหลัง //-เดินหน้า 
                    var n_point = 3; //round
                    for(var pp=0;pp<n_point;pp++){ 
                    
                    await slide_1.touchAction([
                        { action: 'press', x:5, y: 50},
                        { action: 'wait', ms: 1000},
                        { action: 'moveTo', x: step, y: 50 },
                        'release'
                    ])  
                    }
                      try{
                        const checkBank = await client.$('android=new UiSelector().text("ทหารไทย")'); 
                        console.log(checkBank.error);
                      } catch(e){
                      console.log(e);
                      if(system_type=="AAM-digital"){
                        await notify_dpl.send({
                          message: "\n\n หาธนาคารไม่เจอ เคส "+ running+ " \n" + accountNumber+ "\n "+ typePay 
                        }); 
                        }else{
                        await notify.send({
                          message: "\n\n หาธนาคารไม่เจอ เคส "+ running+ " \n" + accountNumber+ "\n "+ typePay 
                        });     
                      }                    
                    }                     
                  }else if( typePay == 'SCB-BANK'){
                    const slide_1 = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/pagerLogoContainer")');
                    var step = -200; //+ถอยหลัง //-เดินหน้า 
                    var n_point = 1; //round
                    for(var pp=0;pp<n_point;pp++){ 
                    
                    await slide_1.touchAction([
                        { action: 'press', x:5, y: 50},
                        { action: 'wait', ms: 1000},
                        { action: 'moveTo', x: step, y: 50 },
                        'release'
                    ])  
                    } 
                      try{
                        const checkBank = await client.$('android=new UiSelector().text("ไทยพาณิชย์")'); 
                        console.log(checkBank.error);
                      } catch(e){
                      console.log(e);
                      if(system_type=="AAM-digital"){
                        await notify_dpl.send({
                          message: "\n\n หาธนาคารไม่เจอ เคส "+ running+ " \n" + accountNumber+ "\n "+ typePay 
                        }); 
                        }else{
                        await notify.send({
                          message: "\n\n หาธนาคารไม่เจอ เคส "+ running+ " \n" + accountNumber+ "\n "+ typePay 
                        });     
                      }                    
                    }                     
                  }else if( typePay == 'THANACHART-BANK'){
                      const slide_1 = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/pagerLogoContainer")');
                    var step = -200; //+ถอยหลัง //-เดินหน้า 
                    var n_point = 3; //round
                    for(var pp=0;pp<n_point;pp++){ 
                    
                    await slide_1.touchAction([
                        { action: 'press', x:5, y: 50},
                        { action: 'wait', ms: 1000},
                        { action: 'moveTo', x: step, y: 50 },
                        'release'
                    ])  
                    }
                      try{
                        const checkBank = await client.$('android=new UiSelector().text("ธนชาต")'); 
                        console.log(checkBank.error);
                      } catch(e){
                      console.log(e);
                      if(system_type=="AAM-digital"){
                        await notify_dpl.send({
                          message: "\n\n หาธนาคารไม่เจอ เคส "+ running+ " \n" + accountNumber+ "\n "+ typePay 
                        }); 
                        }else{
                        await notify.send({
                          message: "\n\n หาธนาคารไม่เจอ เคส "+ running+ " \n" + accountNumber+ "\n "+ typePay 
                        });     
                      }                    
                    }                     
                  }else if( typePay == 'GSB-BANK'){
                      const slide_1 = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/pagerLogoContainer")');
                    var step = -200; //+ถอยหลัง //-เดินหน้า 
                    var n_point = 7; //round
                    for(var pp=0;pp<n_point;pp++){ 
                    
                    await slide_1.touchAction([
                        { action: 'press', x:5, y: 50},
                        { action: 'wait', ms: 1000},
                        { action: 'moveTo', x: step, y: 50 },
                        'release'
                    ])  
                    }                 
                      try{
                        const checkBank = await client.$('android=new UiSelector().text("ออมสิน")'); 
                        console.log(checkBank.error);
                      } catch(e){
                      console.log(e);
                      if(system_type=="AAM-digital"){
                        await notify_dpl.send({
                          message: "\n\n หาธนาคารไม่เจอ เคส "+ running+ " \n" + accountNumber+ "\n "+ typePay 
                        }); 
                        }else{
                        await notify.send({
                          message: "\n\n หาธนาคารไม่เจอ เคส "+ running+ " \n" + accountNumber+ "\n "+ typePay 
                        });     
                      }                   
                    }                     
                  }else if( typePay == 'TISCO-BANK'){
                      const slide_1 = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/pagerLogoContainer")');
                    var step = -200; //+ถอยหลัง //-เดินหน้า 
                    var n_point = 5; //round
                    for(var pp=0;pp<n_point;pp++){ 
                    
                    await slide_1.touchAction([
                        { action: 'press', x:5, y: 50},
                        { action: 'wait', ms: 1000},
                        { action: 'moveTo', x: step, y: 50 },
                        'release'
                    ])  
                    }
                      try{
                        const checkBank = await client.$('android=new UiSelector().text("ทิสโก้")'); 
                        console.log(checkBank.error);
                      } catch(e){
                      console.log(e);
                      if(system_type=="AAM-digital"){
                        await notify_dpl.send({
                          message: "\n\n หาธนาคารไม่เจอ เคส "+ running+ " \n" + accountNumber+ "\n "+ typePay 
                        }); 
                        }else{
                        await notify.send({
                          message: "\n\n หาธนาคารไม่เจอ เคส "+ running+ " \n" + accountNumber+ "\n "+ typePay 
                        });     
                      }                    
                    }                     
                  }else if( typePay == 'KAITNAKIN-BANK'){
                      const slide_1 = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/pagerLogoContainer")');
                    var step = -200; //+ถอยหลัง //-เดินหน้า 
                    var n_point = 9; //round
                    for(var pp=0;pp<n_point;pp++){ 
                    
                    await slide_1.touchAction([
                        { action: 'press', x:5, y: 50},
                        { action: 'wait', ms: 1000},
                        { action: 'moveTo', x: step, y: 50 },
                        'release'
                    ])  
                    } 
                    

                      try{
                        const checkBank = await client.$('android=new UiSelector().text("เกียรตินาคินภัทร")'); 
                        console.log(checkBank.error);
                      } catch(e){
                      console.log(e);
                      if(system_type=="AAM-digital"){
                        await notify_dpl.send({
                          message: "\n\n หาธนาคารไม่เจอ เคส "+ running+ " \n" + accountNumber+ "\n "+ typePay 
                        }); 
                        }else{
                        await notify.send({
                          message: "\n\n หาธนาคารไม่เจอ เคส "+ running+ " \n" + accountNumber+ "\n "+ typePay 
                        });     
                      }                    
                    }                     
                  }else if( typePay == 'ABBC-BANK'){

                      const slide_1 = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/pagerLogoContainer")');
                    var step = 200; //+ถอยหลัง //-เดินหน้า 
                    var n_point = 12; //round
                    for(var pp=0;pp<n_point;pp++){ 
                    
                    await slide_1.touchAction([
                        { action: 'press', x:5, y: 50},
                        { action: 'wait', ms: 1000},
                        { action: 'moveTo', x: step, y: 50 },
                        'release'
                    ])  
                    }
                                            

                      try{
                        const checkBank = await client.$('android=new UiSelector().text("ธนาคารเพื่อการเกษตรและ")'); 
                        console.log(checkBank.error);
                      } catch(e){

                      console.log(e);
                      if(system_type=="AAM-digital"){
                        await notify_dpl.send({
                          message: "\n\n หาธนาคารไม่เจอ เคส "+ running+ " \n" + accountNumber+ "\n "+ typePay 
                        }); 
                        }else{
                        await notify.send({
                          message: "\n\n หาธนาคารไม่เจอ เคส "+ running+ " \n" + accountNumber+ "\n "+ typePay 
                        });     
                      }                    
                    }                     
                  }else if( typePay == 'LH-BANK'){

                      const slide_1 = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/pagerLogoContainer")');
                    var step = -200; //+ถอยหลัง //-เดินหน้า 
                    var n_point = 6; //round
                    for(var pp=0;pp<n_point;pp++){ 
                    
                    await slide_1.touchAction([
                        { action: 'press', x:5, y: 50},
                        { action: 'wait', ms: 1000},
                        { action: 'moveTo', x: step, y: 50 },
                        'release'
                    ])  
                    }
                                            

                      try{
                        const checkBank = await client.$('android=new UiSelector().text("แลนด์ แอนด์เฮ้าส์")'); 
                        console.log(checkBank.error);
                      } catch(e){

                      console.log(e);
                      if(system_type=="AAM-digital"){
                        await notify_dpl.send({
                          message: "\n\n หาธนาคารไม่เจอ เคส "+ running+ " \n" + accountNumber+ "\n "+ typePay 
                        }); 
                        }else{
                        await notify.send({
                          message: "\n\n หาธนาคารไม่เจอ เคส "+ running+ " \n" + accountNumber+ "\n "+ typePay 
                        });     
                      }                    
                    }                     
                  }else if( typePay == 'UOB-BANK'){

                      const slide_1 = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/pagerLogoContainer")');
                    var step = -200; //+ถอยหลัง //-เดินหน้า 
                    var n_point = 5; //round
                    for(var pp=0;pp<n_point;pp++){ 
                    
                    await slide_1.touchAction([
                        { action: 'press', x:5, y: 50},
                        { action: 'wait', ms: 1000},
                        { action: 'moveTo', x: step, y: 50 },
                        'release'
                    ])  
                    }
                                            

                      try{
                        const checkBank = await client.$('android=new UiSelector().text("ยูโอบี")'); 
                        console.log(checkBank.error);
                      } catch(e){

                      console.log(e);
                      if(system_type=="AAM-digital"){
                        await notify_dpl.send({
                          message: "\n\n หาธนาคารไม่เจอ เคส "+ running+ " \n" + accountNumber+ "\n "+ typePay 
                        }); 
                        }else{
                        await notify.send({
                          message: "\n\n หาธนาคารไม่เจอ เคส "+ running+ " \n" + accountNumber+ "\n "+ typePay 
                        });     
                      }                    
                    }                     
                  }else if( typePay == 'SC-BANK'){

                      const slide_1 = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/pagerLogoContainer")');
                    var step = 200; //+ถอยหลัง //-เดินหน้า 
                    var n_point = 15; //round
                    for(var pp=0;pp<n_point;pp++){ 
                    
                    await slide_1.touchAction([
                        { action: 'press', x:5, y: 50},
                        { action: 'wait', ms: 1000},
                        { action: 'moveTo', x: step, y: 50 },
                        'release'
                    ])  
                    }
                                            

                      try{
                        const checkBank = await client.$('android=new UiSelector().text("สแตนดาร์ดฯ")'); 
                        console.log(checkBank.error);
                      } catch(e){

                      console.log(e);
                      if(system_type=="AAM-digital"){
                        await notify_dpl.send({
                          message: "\n\n หาธนาคารไม่เจอ เคส "+ running+ " \n" + accountNumber+ "\n "+ typePay 
                        }); 
                        }else{
                        await notify.send({
                          message: "\n\n หาธนาคารไม่เจอ เคส "+ running+ " \n" + accountNumber+ "\n "+ typePay 
                        });     
                      }                    
                    }                     
                  }
                  
                  
                  console.log("666666");
                  const transferInput = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/editTextInputNumbAccount")');
                  // await transferInput.click();


                  const phoneDest = await transferInput.setValue(accountNumber);

                  const click_amount = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/editTextInputAmountWithKeyboard")');
                  // await click_amount.click();

                  const amount = await click_amount.setValue(parseFloat(baht));
                  // await transferInput.click();
            await sleep(2000);
      try{
                  const click_transfer = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/buttonTransferFundTransfer")');
                  await click_transfer.click();    
            await sleep(2000);
                  const confirm_transfer = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/buttonFundTransFerConfirm_Confirm")');
                  
                  await confirm_transfer.click();
      await sleep(2000);
      
                  const saveSlip = await client.$('android=new UiSelector().resourceId("com.kasikorn.sme.mbanking:id/cardView_fund_transfer_Summary")');
                  await saveSlip.saveScreenshot('./uploads/'+running+accountNumber+'_AAM.png');
                  await sleep(2000);
                              
          
                log("success update ");  
                let fileName = running+accountNumber+'_AAM.png';
                url_slip = await uploadFile(uploadFolder+fileName, fileName);

                if(system_type=="AAM-digital"){
                  await notify_dpl.send({
                    message: "\n\n ทำการโอนเงินไปยัง บัญชี :"+ accountNumber + " เรียบร้อยแล้ว \n\n "+ "URL : "+ url_slip,
                    image: './uploads/'+fileName // local file
                }); 
                  }else{
                    await notify.send({
                      message: "\n\n ทำการโอนเงินไปยัง บัญชี :"+ accountNumber + " เรียบร้อยแล้ว \n\n "+ "URL : "+ url_slip,
                      image: './uploads/'+fileName // local file
                  });     
                }

                  
                  
                  await updateStatus(running, url_slip,system_type,kb_ref);
                  //await sentFCM(phoneNumber, baht, 'THB');
                  await client.deleteSession();
                  // return true;
                  resolve(true);  
                  
                  
                  
                  
                  }catch(e){
                    console.log(e);
                      log("failed transfer "+ e + 'running :'+ running); 
                      
                                  

                                    if(system_type=="AAM-digital"){
                                      await notify_dpl.send({
                                        message: "\n\n Tranfer not success เคส "+ running+ " \n" + accountNumber+ "\n "+ typePay 
                                    }); 
                                      }else{
                                        await notify.send({
                                          message: "\n\n Tranfer not success เคส "+ running+ " \n" + accountNumber+ "\n "+ typePay 
                                      });    
                                    }              
                      
                      
                      await sleep(2000);
                      await client.deleteSession();
                                // return true;
                                resolve(true);  
                    }
                  
                  
                  }    
              }); 
        
    } catch (e) {
        

        
      if(system_type=="AAM-digital"){
        await notify_dpl.send({
          message: "\n\n หาธนาคารไม่เจอ เคส "+ running+ " \n" + accountNumber+ "\n "+ typePay 
      });
        }else{
          await notify.send({
            message: "\n\n หาธนาคารไม่เจอ เคส "+ running+ " \n" + accountNumber+ "\n "+ typePay 
        });     
      }  
            
        console.log(e);
        log("failed transfer "+ e + 'running :'+ running); 
        await sleep(2000);
        // return false;
        reject();
      }

      })
  }





  async function updateStatus(running, slip,system_type,kb_ref) {
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
                      if(system_type=="likepoints2_0"){
                        request
                        .get('https://devdev.prachakij.com/liberyRung/outGoing/likepoints2_0_save_outgoing_by.php?kb_ref='+ kb_ref)
                        .on('response', function(response) {
                          console.log(response.statusCode) // 200
                          console.log(response.headers['content-type']) // 'image/png'
                        });  
                      }                    
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
      await saveSlip.saveScreenshot('./uploads/'+running+accountNumber+'_AAM.png');
                con.query("UPDATE BCT_kbank_thai_withdraw SET authorized = ? , kb_status = ? WHERE running = ?", [authorized, 2, running], async function (err, result, fields, fileName=running+accountNumber+'_AAM.png', acc = accountNumber, runnings = running) {
                    if (err) {
                            log("running problem "+ err + 'running :'+ runnings); 
                            throw err;
                    }
                    if (result) {
                        console.log(result);  
                        log("success update ");  

                        url_slip = await uploadFile(uploadFolder+fileName, fileName);
                        await sendMessage("5059687928:AAHDlsBAFAnLTbciH8N_dUVwFDrBcf_KeZg",tokenTG_dpl, "\n\n ทำการโอนเงินไปยัง บัญชี :"+ acc + " เรียบร้อยแล้ว \n\n "+ "URL : "+ url_slip);
                        return true;
                          // notify.send({
                          //     message: "\n\n ทำการโอนเงินไปยัง บัญชี :"+ acc + " เรียบร้อยแล้ว \n\n "+ "URL : "+ url_slip,
                          //     image: './uploads/'+fileName // local file
                          //      // image: { thumbnail: 'http://example.com/240x240.jpg' } // remote url
                          // }).then(d =>{
                          //   return true; 
                          // })


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

    console.log('Working on job withdrawThai branch AAM');
    console.log(job.data);

    promptPayWithdraw(done);
  });
  //ทำทีละรายการ

  async function sendMessage(token, chatId, message) {
      const url = `https://api.telegram.org/bot${token}/sendMessage`;

      const response = await fetch(url, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              chat_id: chatId,
              text: message
          })
      });

      const data = await response.json();
      if (!data.ok) {
          throw new Error(`Error sending message: ${data.description}`);
      }
      return data;
  }

  // sendMessage("5059687928:AAHDlsBAFAnLTbciH8N_dUVwFDrBcf_KeZg",tokenTG_dpl, "ทดสอบส่งข้อความ");



  async function promptPayWithdraw(done) {

        var con = mysql.createConnection({
        host     : databaseHost,
        user     : databaseUser,
        password : databasePassword,
        database : databaseName
      });
        await sleep(3000);
        console.log('prompt start !');

      con.connect();
      const sql = "SELECT * FROM BCT_kbank_thai_withdraw WHERE authorized = ? and kb_status = ? and kb_out in ('6303','3782','5943') ORDER BY running LIMIT 10";
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
            if(result[i].kb_bank == 'promptpay'){
              if(result[i].kb_account.length == 13){
                typePay = 'idCard';
              }else{
                typePay = 'phoneNumber'
              }
      
              let detail = await kplus_sme_promptpay(result[i].running, result[i].authorized, result[i].kb_status, result[i].kb_account, result[i].kb_amount, typePay, "",result[i].kb_out,result[i].system_type,result[i].kb_ref);
              console.log(detail);          
            }else if(result[i].kb_bank == 'KASIKORN-BANK'){
                typePay = 'KASIKORN-BANK';
              let detail = await kplus_sme_bank(result[i].running, result[i].authorized, result[i].kb_status, result[i].kb_account, result[i].kb_amount, typePay, "",result[i].kb_out,result[i].system_type,result[i].kb_ref);
                console.log(detail);  
            }else if(result[i].kb_bank == 'KRUNGSRI-BANK'){
                typePay = 'KRUNGSRI-BANK';
                let detail = await kplus_sme_bank(result[i].running, result[i].authorized, result[i].kb_status, result[i].kb_account, result[i].kb_amount, typePay, "",result[i].kb_out,result[i].system_type,result[i].kb_ref);
                console.log(detail);            
            }else if(result[i].kb_bank == 'BANGKOK-BANK'){
                typePay = 'BANGKOK-BANK';
                let detail = await kplus_sme_bank(result[i].running, result[i].authorized, result[i].kb_status, result[i].kb_account, result[i].kb_amount, typePay, "",result[i].kb_out,result[i].system_type,result[i].kb_ref);
                console.log(detail);            
            }else if(result[i].kb_bank == 'KRUNGTHAI-BANK'){
                typePay = 'KRUNGTHAI-BANK';
                let detail = await kplus_sme_bank(result[i].running, result[i].authorized, result[i].kb_status, result[i].kb_account, result[i].kb_amount, typePay, "",result[i].kb_out,result[i].system_type,result[i].kb_ref);
                console.log(detail);            
            }else if(result[i].kb_bank == 'TMB-BANK'){
                typePay = 'TMB-BANK';
                let detail = await kplus_sme_bank(result[i].running, result[i].authorized, result[i].kb_status, result[i].kb_account, result[i].kb_amount, typePay, "",result[i].kb_out,result[i].system_type,result[i].kb_ref);
                console.log(detail);            
            }else if(result[i].kb_bank == 'SCB-BANK'){
                typePay = 'SCB-BANK';
                let detail = await kplus_sme_bank(result[i].running, result[i].authorized, result[i].kb_status, result[i].kb_account, result[i].kb_amount, typePay, "",result[i].kb_out,result[i].system_type,result[i].kb_ref);
                console.log(detail);            
            }else if(result[i].kb_bank == 'THANACHART-BANK'){
                typePay = 'THANACHART-BANK';
                let detail = await kplus_sme_bank(result[i].running, result[i].authorized, result[i].kb_status, result[i].kb_account, result[i].kb_amount, typePay, "",result[i].kb_out,result[i].system_type,result[i].kb_ref);
                console.log(detail);            
            }else if(result[i].kb_bank == 'GSB-BANK'){
                typePay = 'GSB-BANK';
                let detail = await kplus_sme_bank(result[i].running, result[i].authorized, result[i].kb_status, result[i].kb_account, result[i].kb_amount, typePay, "",result[i].kb_out,result[i].system_type,result[i].kb_ref);
                console.log(detail);            
            }else if(result[i].kb_bank == 'TISCO-BANK'){
                typePay = 'TISCO-BANK';
                let detail = await kplus_sme_bank(result[i].running, result[i].authorized, result[i].kb_status, result[i].kb_account, result[i].kb_amount, typePay, "",result[i].kb_out,result[i].system_type,result[i].kb_ref);
                console.log(detail);            
            }else if(result[i].kb_bank == 'KAITNAKIN-BANK'){
                typePay = 'KAITNAKIN-BANK';
                let detail = await kplus_sme_bank(result[i].running, result[i].authorized, result[i].kb_status, result[i].kb_account, result[i].kb_amount, typePay, "",result[i].kb_out,result[i].system_type,result[i].kb_ref);
                console.log(detail);            
            }else if(result[i].kb_bank == 'ABBC-BANK'){
                typePay = 'ABBC-BANK';
                let detail = await kplus_sme_bank(result[i].running, result[i].authorized, result[i].kb_status, result[i].kb_account, result[i].kb_amount, typePay, "",result[i].kb_out,result[i].system_type,result[i].kb_ref);

                console.log(detail);            
            }else if(result[i].kb_bank == 'LH-BANK'){
                typePay = 'LH-BANK';
                let detail = await kplus_sme_bank(result[i].running, result[i].authorized, result[i].kb_status, result[i].kb_account, result[i].kb_amount, typePay, "",result[i].kb_out,result[i].system_type,result[i].kb_ref);

                console.log(detail);            
            }else if(result[i].kb_bank == 'UOB-BANK'){
                typePay = 'UOB-BANK';
                let detail = await kplus_sme_bank(result[i].running, result[i].authorized, result[i].kb_status, result[i].kb_account, result[i].kb_amount, typePay, "",result[i].kb_out,result[i].system_type,result[i].kb_ref);

                console.log(detail);            
            }else if(result[i].kb_bank == 'SC-BANK'){
                typePay = 'SC-BANK';
                let detail = await kplus_sme_bank(result[i].running, result[i].authorized, result[i].kb_status, result[i].kb_account, result[i].kb_amount, typePay, "",result[i].kb_out,result[i].system_type,result[i].kb_ref);

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
