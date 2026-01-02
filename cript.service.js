import CryptoJS from 'crypto-js';



export class CriptService {
    
    constructor() {
    //this.key = "melinaRosaci1234"; // meglio usare variabile d'ambiente
    this.secretKey = '1234567890123456';

    
  }

  encrypt(testoDaCriptare) {
    //return CryptoJS.AES.encrypt(text, this.key).toString();
    const key = CryptoJS.enc.Utf8.parse(this.secretKey);
    const iv = CryptoJS.enc.Utf8.parse(this.secretKey.substring(0, 16));
    const testo = CryptoJS.AES.encrypt(testoDaCriptare, key, 
      {  iv,  
        mode: CryptoJS.mode.CBC,      
        padding: CryptoJS.pad.Pkcs7    
      }).toString();
   
      return testo; 

  }

  decrypt(cipher) {
    const bytes = CryptoJS.AES.decrypt(cipher, this.key);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

 


  

}