import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { DataService, LocalStorageService, AppService } from '../../service';
import { UserInfo } from '../../class';

@Component({
  selector: 'page-add-address',
  templateUrl: 'add-address.page.html',
  styleUrls: ['./add-address.page.scss']
})
export class AddAddressPage extends UserInfo {
  name: string = null; // 姓名
  sex: number = 1; // 性别
  phone: string = null; // 电话
  phoneBk: boolean = false; // 备用电话
  addressDetail: string = null; // 详细地址
  tag: string = ''; // 备注
  tagType: number = 1; // 备注类型
  phone_bk: boolean = false; // 是否选择备注电话
  anntherPhoneNumber: string = ''; // 备注电话
  showAlert: boolean = false; // 弹出框
  fromWhere: string;
  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public localStorageService: LocalStorageService,
    public appService: AppService,
    public dataService: DataService,
    public toastCtrl: ToastController) {
    super(appService, localStorageService);
    this.fromWhere = this.route.snapshot.queryParamMap.get('from');
  }

  searchAddress(): any {
    return this.appService.searchAddress;
  }

  // 选择性别
  chooseSex(sex) {
    this.sex = sex;
  }
  // 选择标签
  chooseTag(tag) {
    this.tag = tag;
  }

  async toastTip(message: string) {
    let toast = await this.toastCtrl.create({
        message: message,
        duration: 2000,
        position: 'bottom'
      });
      toast.present();
  }

  // 保存地址信息
  addAddress() {
    let alertText = '';
    if (!this.userId) {
      alertText = '请登录';
    } else if (!this.name) {
      this.showAlert = true;
      alertText = '请输入姓名';
    } else if (!this.phone) {
      this.showAlert = true;
      alertText = '请输入电话号码';
    } else if (!this.searchAddress()) {
      this.showAlert = true;
      alertText = '请选择地址';
    } else if (!this.addressDetail) {
      this.showAlert = true;
      alertText = '请输入详细地址';
    }
    if (alertText) {
      this.toastTip(alertText);
      return;
    }
    if (this.tag === '家') {
      this.tagType = 2;
    } else if (this.tag === '学校') {
      this.tagType = 3;
    } else if (this.tag === '公司') {
      this.tagType = 4;
    }
    this.dataService.postAddAddress(this.userId, this.searchAddress().name, this.addressDetail,
      this.appService.geohash, this.name, this.phone, this.anntherPhoneNumber, 0,
      this.sex, this.tag, this.tagType)
    .subscribe(res => {
      // 保存成功返沪上一页，否则弹出提示框
      if (res.message) {
        this.toastTip(res.message);
      } else {
        this.appService.searchAddress = '';
        this.appService.notify.emit('refresh');
        if (this.fromWhere === 'searchAddress') {
          this.router.navigate(['/confirmOrder', 'chooseAddress']);
        } else {
          this.router.navigate(['/address']);
        }
      }
    });
  }
}
