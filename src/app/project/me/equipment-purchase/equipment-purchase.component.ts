import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PortalNavigation } from 'src/app/portal/portal.navigation';
import { ConstantHandler } from 'src/modules/utils/constant-handler';
import { DataEquipmentPurchaseHandler } from 'src/data/me/equipment-purchase';
import { Utils } from 'src/modules/utils/utils';
import { NzNotificationService, UploadFile } from 'ng-zorro-antd';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { IdCounter } from 'src/modules/utils/id-counter';
import { Observable, Observer } from 'rxjs';
import { KeyVerticalMenuEvent } from 'src/modules/key/vertical-menu/vertical-menu.event';
import { UtilsMe } from '../utils/utils-me';

@Component({
  selector: 'app-equipment-purchase',
  templateUrl: './equipment-purchase.component.html',
  styleUrls: ['./equipment-purchase.component.scss']
})
export class EquipmentPurchaseComponent implements OnInit {

  // 横幅图片
  CH_ME_MATERIAL_BANNER_SRC: any;

  // 横幅菜单
  CH_ME_BANNER_MENU: KeyVerticalMenuEvent[];

  // 门户导航
  portalNav: any;

  // 数据助手
  dataHandler: any;

  listData: any[] = [];

  // 一页大小
  pageSize = 8;

  // 总数据
  total: number = 0;

  // 当前页下标
  activePagaIndex: number = 1;

  // 搜索文本
  searchValue: any;

  // 按钮排序激活
  btnSortActiveMap: any = {
    price: 0,
    totalQty: 0,
    qty: 0
  };

  validateForm: FormGroup;

  avatarUrl: any;
  loading = false;

  constructor(private router: Router, private notification: NzNotificationService, private fb: FormBuilder) {
    this.portalNav = new PortalNavigation(router);
  }

  ngOnInit() {
    this.CH_ME_MATERIAL_BANNER_SRC = ConstantHandler.CH_ME_MATERIAL_BANNER_SRC;
    this.CH_ME_BANNER_MENU = ConstantHandler.CH_ME_BANNER_MENU;
    this.dataHandler = DataEquipmentPurchaseHandler;
    this.total = this.dataHandler.LIST_DATA.length;
    this.handleListDataPagination(this.dataHandler.LIST_DATA, this.activePagaIndex);

    this.validateForm = this.fb.group({
      title: [null, [Validators.required]],
      type: [null, [Validators.required]],
      area: [null, [Validators.required]],
      brand: [null, [Validators.required]],
      place: [null, [Validators.required]],
      explain: [null]
    });
  }

  /**
   * 点击横幅菜单
   * @param menu 
   */
  onClickBannerMenu(menu: KeyVerticalMenuEvent) {
    UtilsMe.clickBannerMenu(this.portalNav, menu);
  }

  submitForm(): void {
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }
    this.listData.unshift({
      id: IdCounter.newId(),
      title: this.validateForm.get('title').value,
      equipmentType: this.validateForm.get('type').value,
      equipmentVolumes: '100',
      date: '2019-04-29',
      area: this.validateForm.get('area').value,
      explain: this.validateForm.get('explain').value,
      location: '所在地',
      price: '50000',
      src: this.avatarUrl ? this.avatarUrl : ''
    });
    this.total = this.total + 1;
    this.notification.create(
      'success',
      '提示',
      '发出求购成功！',
    );

  }

  /**
   * 处理列表数据
   */
  handleListData(listData: any[]) {
    if (listData != null && listData.length > 0) {
      let listDataTemp = Utils.arrayRandomSort(listData);
      this.listData = [];
      let len = listData.length > this.pageSize ? this.pageSize : listData.length;
      for (let i = 0; i < len; i++) {
        this.listData.push(listDataTemp[i]);
      }
    } else {
      this.listData = [];
    }
  }

  /**
   * 处理列表数据分页
   * @param data 
   * @param pageIndex 
   */
  handleListDataPagination(data: any[], pageIndex: number) {
    this.listData = Utils.dataPagination(data, pageIndex, this.pageSize);
    this.total = data.length;
  }

  /**
   * 页码改变
   */
  onPageIndexChange(event: any) {
    this.activePagaIndex = event
    this.handleListDataPagination(this.dataHandler.LIST_DATA, this.activePagaIndex);
  }

  /**
   * 点击分类
   * @param event 
   */
  onClickType(event: any) {
    this.listData = Utils.arrayRandomSort(this.listData);
  }

  /**
   * 点击按钮进行排序
   * @param event 
   */
  onClickButtonSortChange(event: any, id: any) {
    this.btnSortActiveMap = {
      price: 0
    };
    this.btnSortActiveMap[id] = event;
    this.listData = Utils.arrayKeySort(this.dataHandler.LIST_DATA, id, event, true);
    this.onSearch();
  }

  // 搜索
  onSearch() {
    this.activePagaIndex = 1;
    if (this.dataHandler.LIST_DATA && this.searchValue != null) {
      const regExp = new RegExp(Utils.escapeRegexp(this.searchValue), 'ig');
      let listData = this.dataHandler.LIST_DATA.filter((row: any) => {
        if (row.title) {
          let text = '' + row.title;
          if (text.match(regExp)) {
            return true;
          }
        }
        if (row.equipmentType) {
          let text = '' + row.equipmentType;
          if (text.match(regExp)) {
            return true;
          }
        }
        if (row.equipmentVolumes) {
          let text = '' + row.equipmentVolumes;
          if (text.match(regExp)) {
            return true;
          }
        }
        if (row.location) {
          let text = '' + row.location;
          if (text.match(regExp)) {
            return true;
          }
        }
      });
      this.handleListDataPagination(listData, this.activePagaIndex);
    } else {
      this.handleListDataPagination(this.dataHandler.LIST_DATA, this.activePagaIndex);
    }
  }

  /**
   * 收藏
   * @param id 
   */
  onCollection(id: any) {
    this.notification.create(
      'success',
      '提示',
      '收藏成功！',
    );
  }

  /**
   * 联系方式
   * @param id 
   */
  onTel(id: any) {
    this.navigateDeveloping();
  }

  /**
   * 导航到正在开发中页面
   */
  navigateDeveloping() {
    this.router.navigateByUrl('developing');
  }


  beforeUpload = (file: File) => {
    return new Observable((observer: Observer<boolean>) => {
      const isJPG = (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/bmp');
      if (!isJPG) {
        this.notification.create(
          'error',
          '提示',
          '只能上传图片文件！',
        );
        observer.complete();
        return;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        this.notification.create(
          'warning',
          '提示',
          '图像必须小于2MB！',
        );
        observer.complete();
        return;
      }
      observer.next(isJPG && isLt2M);
      observer.complete();
    });
  };

  handleChange(info: { file: UploadFile }): void {
    switch (info.file.status) {
      case 'uploading':
        this.loading = true;
        break;
      case 'done':
        this.getBase64(info.file!.originFileObj!, (img: string) => {
          this.loading = false;
          this.avatarUrl = img;
        });
        break;
      case 'error':
        this.getBase64(info.file!.originFileObj!, (img: string) => {
          this.loading = false;
          this.avatarUrl = img;
        });
        /* this.notification.create(
          'error',
          '提示',
          '网络出错',
        );
        this.loading = false; */
        break;
    }
  }

  getBase64(img: File, callback: (img: string) => void): void {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result!.toString()));
    reader.readAsDataURL(img);
  }

}
