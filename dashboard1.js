frappe.provide('frappe.spdashboard')
var user_lang = ''
frappe.pages['dashboard1'].on_page_load = function (wrapper) {
    var chartDataQuantityForTopStockItem = '';
    var chartDataAmountForTopStockItem = '';
    var chartDataQuantityForTopSellingItem = '';
    var chartDataAmountForTopSellingItem = '';
    var chartDataForProjectWise ='';


    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Dashboard',
        single_column: true
    });
    frappe.call({
        method: 'spdashboard.sp_dashboard.page.dashboard1.dashboard1.user_info',
        async: false,
        callback(r) {
            // debugger;
            if (r.message) {
                user_lang =  r.message
                frappe.require('assets/spdashboard/css/dashboard1_ar.css')
            } else {
                frappe.require('assets/spdashboard/css/dashboard1_eng.css')
            }
        }
    })


    frappe.dashboard_page = page

    $('.layout-main-section').removeClass();
    $('.page-head').removeClass();
    $('.page-body').css('width','100%')
    console.log(page);
    page.$title_area.remove();
    page.$sub_title_area.remove();
    setTimeout(function () {
        frappe.spdashboard.initCharts(page);

    },100)

}


$.extend(frappe.spdashboard,{
    initCharts: function(page){
        debugger;
        frappe.spdashboard.setup_module_click()
        let enabledCharts = frappe.spdashboard.getEnabledCharts()
        if(enabledCharts != null)
            frappe.spdashboard.renderCharts(page,enabledCharts)
        else{
            let html = frappe.spdashboard.navigation()
            // let html = ''

            html += '<div class="container"><h1>No Dashboard Configure</h1></div>'
            page.main.append(html);

        }
        if (user_lang == 'ar') {
            $('div[data-link="snapprocesslist"]').find('label').text('المفاجئة والبريد')
            $('div[data-link="pos"]').find('label').text('نقطة البيع')
            $('div[data-link="modules/etl"]').find('label').text('استخراج تحويل الحمل')
            $('div[data-link="List/Sales Invoice"]').find('label').text('فاتورة المبيعات')
            $('div[data-link="List/Purchase Invoice"]').find('label').text('فاتورة الشراء')
            $('div[data-link="Tree/Chart Of Account"]').find('label').text('الرسم البياني للحساب')
            $('div[data-link="List/Journal Entry"]').find('label').text('إفتتاحية المجلة')
            $('div[data-link="List/Payment Entry"]').find('label').text('دخول الدفع')
            $('div[data-link="List/Stock Entry"]').find('label').text('دخول الأسهم')
            $('div[data-link="explore"]').find('label').text('استكشاف - بحث')
            $('div[data-link="Snap & Post"]').text('الالتقاط و المشاركة')
            $('div[data-link="Company Info"]').text('بيانات الشركة')
            $('div[data-link="Newsletter"]').text('النشرة الإخبارية')
            $('small[data-link="Draft"]').text('مشروع')
            $('small[data-link="Pending"]').text('قيد الانتظار')
            $('small[data-link="In Process"]').text('تحت المعالجة')
            $('small[data-link="Re-Work"]').text('إعادة العمل')
            $('small[data-link="Completed"]').text('منجز')
            $('#lu_Chart000020').text('آخر تحديث: منذ 1 ثانية')
            $('#lu_Chart000021').text('آخر تحديث: منذ 1 ثانية')
            $('#lu_Chart000023').text('آخر تحديث: منذ 1 ثانية')
            $('#lu_Chart000009').text('آخر تحديث: منذ 5 ثوانٍ')
            $('#lu_Chart000001').text('آخر تحديث: منذ 3 ثوانٍ')
            $('#lu_Chart000003').text('آخر تحديث: منذ 1 ثوانٍ')
            $('#lu_Chart000002').text('آخر تحديث: منذ 1 ثوانٍ')
            $('#lu_Chart000024').text('آخر تحديث: منذ 1 ثوانٍ')
            $('#lu_Chart000005').text('آخر تحديث: منذ 4 ثوانٍ')
            $('#lu_Chart000004').text('آخر تحديث: منذ 4 ثوانٍ')
            $('#lu_Chart000006').text('آخر تحديث: منذ 4 ثوانٍ')
            $('#lu_Chart000007').text('آخر تحديث: منذ 4 ثوانٍ')

            $('b[data-link="TRN"]').text('رقم الرخصة التجارية#')
            $('b[data-link="Auditor_Name"]').text('اسم المراجع:')
            $('b[data-link="Email"]').text('البريد الإلكتروني:')
            $('b[data-link="Contract_Start_Date"]').text('تاريخ بدء العقد:')
            $('b[data-link="Customer_Type"]').text('نوع العميل:')
            $('b[data-link="Description"]').text('وصف:')
            $('a[data-link="see_all"]').text('اظهار الكل')
            $('span[data-link="Sales Summary"]').text('ملخص المبيعات')
            $('p[data-link="Total Sales"]').text('إجمالي المبيعات')
            $('p[data-link="Values-"]').text('القيم بالآلاف')
            $('p[data-link="Values-Total Sales"]').text('القيم بالآلاف')
            $('small[data-link="Un-Paid"]').text('غير مأجور')
            $('small[data-link="Paid"]').text('دفع')
            $('div[data-link="Payment Status"]').text('حالة السداد')
            $('span[data-link="Monthly Income And Expense"]').text('الدخل الشهري والمصروفات')
            $('div[data-link="Monthly Income And Expense"]').text('القيم بالآلاف')
            $('span[data-link="Monthly Purchase"]').text('المشتريات الشهرية')
            $('span[data-link="Monthly Sales"]').text('المبيعات الشهرية')
            $('div[data-link="Monthly Purchase"]').text('المشتريات الشهرية')
            $('div[data-link="Monthly Sales"]').text('القيم بالآلاف')
            $('div[data-link="Login Activity"]').text('نشاط تسجيل الدخول')
            $('span[data-link="Total Payable"]').text('إجمالي مستحق الدفع')
            $('span[data-link="Total Receivable"]').text('مجموع المستحقات')
            $('span[data-link="Top Five Stock Items"]').text('أعلى خمسة بنود المخزون')
            $('span[data-link="Top Five Selling Items"]').text('أعلى خمسة بنود البيع')
            $('label[data-link="Total Amount"]').text('المبلغ الإجمالي')
            $('.b2').html('كمية')
            $('.a2').html('كمية')
            $('.b1').html('كمية')
            $('.a1').html('كمية')
        }
    },
    navigation: function(){
        var all_icons = [];
        var picapp_icon = {
         module_name: 'Snap & Process',
         label: __('Snap & Post'),
         _label: __('Snap & Process'),
         _id: 'Snap & Process',
         _doctype: '',
         icon: 'pe-7s-camera',
         color: '#7578f6',
         link: 'snapprocesslist'

      };
      picapp_icon.app_icon = frappe.ui.app_icon.get_html(picapp_icon);
      all_icons.push(picapp_icon);

        var pos_icon = {
         module_name: ':Point Of Sale',
         label: "Point Of Sale",
         _label: __('Point Of Sale'),
         _id: 'Point Of Sale',
         _doctype: '',
         icon: 'pe-7s-calculator',
         color: '#7578f6',
         link: 'pos'
      };
      pos_icon.app_icon = frappe.ui.app_icon.get_html(pos_icon);
      all_icons.push(pos_icon);

        var dynamic_icons = frappe.get_desktop_icons()
        var length = 0;
        if(dynamic_icons.length > 9){
            length = 9
        }
        else{
            if(dynamic_icons.length > 0){
                length = dynamic_icons.length
            }
        }

        for (i = 0; i < length; i++) {
          all_icons.push(dynamic_icons[i])
        }

//        $.each(frappe.get_desktop_icons(),function(k,v){
//            all_icons.push(v);
//        })

        var explore_icon = {
         module_name: 'Explore',
         label: 'Explore',
         _label: __('Explore'),
         _id: 'Explore',
         _doctype: '',
         icon: 'pe-7s-menu',
         color: '#7578f6',
         link: 'explore'
      };
      explore_icon.app_icon = frappe.ui.app_icon.get_html(explore_icon);
      all_icons.push(explore_icon);


        let html = `<div class="row" style="margin-bottom: 2%;">
            <div class="col-lg-12">
                 <div class="hpanel mb-rs box-dash">
                        <div class="panel-body">
                            <div class="row">
                                `+frappe.spdashboard.navigation_items(all_icons)+`
                            </div>
                        </div>
                    </div>
                </div>
            </div><div class="row" style="margin-bottom: 2%;">
            <div class="col-lg-12">
                 <div class="hpanel web-rs box-dash" style="display: none">
                        <div class="panel-body">
                            <div class="row">
                                <div class="pull-left" style="cursor: pointer;width: 50%"> <center> <a href="desk#snapprocesslist"> <i class="pe-7s-camera color-ico" style="font-size: 46px;"></i> <br> <label style="font-size: 10px;">__('Snap & Process')</label> </a> </center> </div>
                                <div class="pull-right" style="cursor: pointer;width: 50%"> <center> <a href="desk#explore"> <i class="pe-7s-menu color-ico" style="font-size: 46px;"></i> <br> <label style="font-size: 10px;">__('Explore')</label> </a> </center> </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>`;



        return html

    },
    navigation_items: function(icons){
        let items=``;
        let count=0;
        $.each(icons,function(k,v){
            count++
        })
        let columns = 12/count;
        columns = Math.ceil(columns)
        if(columns*count > 12)
            columns = columns-1

        $.each(icons,function(k,v){
            items += `<div class="col-md-`+columns+`" style="cursor: pointer">
                        <center>
                            <div class="nav-icon" data-link="`+v.link+`">
                            <i class="`+v.icon+` color-ico" style="font-size: 46px;"></i>
                            <br/>
                            <label style="font-size: 10px;">`+v.label+`</label>
                            </div>
                        </center>
                    </div>`
        });
        return items
    },
    setup_module_click: function() {
        frappe.dashboard_page.wrapper.on("click", ".nav-icon", function() {
            frappe.spdashboard.open_module($(this));
        });
    },
    open_module: function(parent) {
      var link = parent.attr("data-link");
      if(link) {
         if(link.indexOf('javascript:')===0) {
            eval(link.substr(11));
         } else if(link.substr(0, 1)==="/" || link.substr(0, 4)==="http") {
            window.open(link, "_blank");
         } else {
            frappe.set_route(link);
         }
         return false;
      } else {
         var module = frappe.get_module(parent.attr("data-name"));
         if (module && module.onclick) {
            module.onclick();
            return false;
         }
      }
   },
    chartContent: function(v){
        html = ``;
        sec = ''
        var refresh_rate = v.refresh_rate.split('s')[0]
        var currency = '';
        var display_on_screen = '';
        var counterClass = ''
        if(refresh_rate == 1)
            sec = 'second';
        else
            sec = 'seconds';

        if(v.display_on_screen == 'Web'){
            display_on_screen = 'web';
        }else if(v.display_on_screen == 'Mobile'){
            display_on_screen = 'mobile';
        }

        last_update = refresh_rate+' '+sec+' ago';
        if(v.currency){
            currency = 'AED'
            counterClass = 'countCurrency'
        }else{
            counterClass = 'countItem'
        }




        if(v.widget_type == 'Range'){
                    html += `<div class="col-lg-`+v.number_of_columns+` `+display_on_screen+`">
                        <div class="hpanel stats box-dash">
                            <div class="header-dash" data-link="`+v.title+`" style="color:#fff;background-color: #a50000;"><span data-link="`+v.title+`">`+v.title+`</span>
                                <span id="cf_`+v.name+`"></span>
                            </div>
                            <div class="panel-body" style="height:`+v.height_in_px+`px;">
                                <div>
                                    <h3 class="m-b-xs countCurrency" style="font-weight: 200;"><span id="value_`+v.name+`"></span></h3>
                                    <div class="progress m-t-xs full progress-small">
                                        <div style="width: 28%" aria-valuemax="100" aria-valuemin="0" aria-valuenow="55" role="progressbar" class=" progress-bar progress-bar-success">
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="footer-dash"> <span id="lu_`+v.name+`">Last update: `+last_update+`</span> </div>
                        </div>
                    </div>`
                }
                else if(v.widget_type == 'Counter1'){
                    debugger;
                    html += `<div class="col-lg-`+v.number_of_columns+` `+display_on_screen+`">
                                <div class="hpanel stats box-dash">
                                     <div class="header-dash" data-link="`+v.title+`" style="color:#fff;background-color: #a50000;"><span data-link="`+v.title+`">`+v.title+`</span>
                                        <span id="cf_`+v.name+`"></span>
                                    </div>
                                    <div class="panel-body" style="height:`+v.height_in_px+`px;">
                                        <div>
                                            <div class="row">
                                                <label style="margin-left: 10px;margin-top: 20px;margin-bottom: 0px;" data-link="Total Amount">Total Amount</label>
                                                <h1 style="margin-left: 10px;margin-top: 10px;margin-bottom: -10px;font-weight: 200;font-size: 36px" class="color-dash">`+currency+` <span class="countCurrency"><span id="value_`+v.name+`"></span></span></h1>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="footer-dash"> <span id="lu_`+v.name+`">Last update: `+last_update+`</span> </div>
                                </div>
                            </div>`

                }else if(v.widget_type == 'Counter2'){
                    html += `<div class="col-lg-`+v.number_of_columns+` `+display_on_screen+`">
                                <div class="hpanel stats box-dash">
                                    <div class="header-dash" data-link="`+v.title+`" style="color:#fff;background-color: #a50000;"><span data-link="`+v.title+`">`+v.title+`"</span>
                                        <span id="cf_`+v.name+`"></span>
                                    </div>
                                    <div class="panel-body" style="height:`+v.height_in_px+`px;">
                                        <div class="list-item-container">
                                            <div class="list-item2" style="border: none!important;"><h3 class="countCurrency no-margins font-extra-bold color-dash "
                                                                        style="font-size: 40px;"><span id="value_`+v.name+`"></span></h3>
                                                <small  style="font-size: 15px;">No of Items</small>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="footer-dash"> <span id="lu_`+v.name+`">Last update: `+last_update+`</span> </div>
                                </div>
                            </div>`

                }else if(v.widget_type == 'Counter3'){
                    html += `<div class="col-lg-`+v.number_of_columns+` `+display_on_screen+`">
                                <div class="hpanel stats box-dash">
                                    <div class="header-dash" style="color:#fff;background-color: #a50000;" ><span data-link="`+v.title+`">`+v.title+`"</span>
                                        <span id="cf_`+v.name+`"></span>
                                    </div>
                                    <div class="panel-body" style="height:`+v.height_in_px+`px;">
                                        <div class="list-item-container">
                                            <div class="list-item2" style="border: none!important;"><h3 class="no-margins font-extra-bold text-color3"
                                                                        style="font-size: 40px;">`+currency+` <span class="`+counterClass+`" id="countCurrency"><span id="value_`+v.name+`"></span></span></h3>
                                                <small  style="font-size: 15px;">Total Stock Value</small>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="footer-dash">
                                       <span id="lu_`+v.name+`">Last update: `+last_update+`</span>
                                    </div>
                                </div>
                            </div>`
                }else if(v.widget_type == 'Counter4'){
                    debugger;
                    html += `
                    <div class="col-lg-`+v.number_of_columns+` `+display_on_screen+`">
                            <div class="hpanel">
                                <div class="panel-body" style="height:`+v.height_in_px+`px;">
                                    <div class="pull-left" style="width: 30%;">
                                        <i class="`+v.icon+` fa-3x"></i>
                                    </div>
                                    <div style="margin-top: 0px !important;">
                                        <label style="color: #A5000C;margin-bottom: 0px;font-size: 20px;">`+currency+` <span class="`+counterClass+`" id="countCurrency"><span id="value_`+v.name+`"></span></span></label>
                                        <br>
                                        <small>
                                             `+v.title+`
                                             <span id="cf_`+v.name+`"></span>
                                        </small>
                                    </div>
                                </div>
                            </div>
                        </div>`;
                }else if(v.widget_type == 'Counter5'){
                    html += `<div class="col-lg-`+v.number_of_columns+` `+display_on_screen+`">
                                <div class="hpanel stats box-dash">
                                     <div class="header-dash" data-link="`+v.title+`" style="color:#fff;background-color: #a50000;"><span data-link="`+v.title+`">`+v.title+`</span>
                                        <span id="cf_`+v.name+`"></span>
                                    </div>
                                    <div class="panel-body" style="height:`+v.height_in_px+`px;">
                                        <div>
                                            <div class="row">
                                                <label style="margin-left: 10px;margin-top: 20px;margin-bottom: 0px;" data-link="Total Sms Count ">SMS Used</label>
                                                <h1 style="margin-left: 10px;margin-top: 10px;margin-bottom: -10px;font-weight: 200;font-size: 36px" class="color-dash">`+currency+` <span class="countCurrency"><span id="value_`+v.name+`"></span></span></h1>
                                                <label style="margin-left: 10px;margin-top: 20px;margin-bottom: 0px;" data-link="Total Sms Count ">Paid SMS</label>
                                                <h1 style="margin-left: 10px;margin-top: 10px;margin-bottom: -10px;font-weight: 200;font-size: 36px" class="color-dash">`+currency+` <span class="countCurrency"><span id="value1_`+v.name+`"></span></span></h1>
                                                <label style="margin-left: 10px;margin-top: 20px;margin-bottom: 0px;" data-link="Total Sms Count ">Free SMS</label>
                                                <h1 style="margin-left: 10px;margin-top: 10px;margin-bottom: -10px;font-weight: 200;font-size: 36px" class="color-dash">`+currency+` <span class="countCurrency"><span id="value2_`+v.name+`"></span></span></h1>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="footer-dash"> <span id="lu_`+v.name+`">Last update: `+last_update+`</span> </div>
                                </div>
                            </div>`

                }else if(v.widget_type == 'Custom') {
            debugger;
            if (v.widget_items.length > 0) {
                var height = '';
                if (v.auto_height == 1) {
                    height = 'auto';
                } else {
                    height = v.height_in_px + 'px';
                }
                // //debugger;
                html += `
                                <div class="col-lg-` + v.number_of_columns + ` ` + display_on_screen + `">
                                    <div class="hpanel stats box-dash">
                                        <div class="header-dash"  style="color:#fff;background-color: #a50000;" > <span data-link="`+v.title+`">`+ v.title + `</span>
                                            <span id="cf_` + v.name + `"></span>
                                        </div>
                                        <div class="panel-body" style="height:` + height + `">`;
                first_column = true;
                endColumn = 0;
                lastWidget = '';
                $.each(v.widget_items, function (idx, val) {
                    // //debugger;
                    if (val.widget_status != 1) {
                        if (val.widget_type == 'Section Break') {
                            if (lastWidget != '')
                                html += `</div>`;
                            html += `<div class="row" style="margin-bottom:2%;"></div>`;
                            endColumn = 0;
                            first_column = true;
                            lastWidget = '';
                            return true;

                        }
                        if (val.widget_type == 'Column Break') {
                            lastWidget = val.widget_type
                            first_column = true

                        }

                        if (lastWidget == val.widget_type) {
                            if (endColumn > 0) {
                                html += `</div>`;
                            }
                            if (first_column) {
                                html += `<div class="col-lg-` + val.number_of_columns + `">`;
                                first_column = false
                                endColumn++
                            }
                        } else {
                            html += frappe.spdashboard.chartChildContent(val)

                        }
                    }
                })
                html += `
                                </div>
                                </div>
                                <div class="footer-dash">
                                    <span id="lu_` + v.name + `">Last update: ` + last_update + `</span>
                                </div>
                            </div>
                        </div>`;
                    }
                }
                else if(v.widget_type == 'Snap & Post') {
            // debugger;
            if (v.widget_items.length > 0) {
                var height = '';
                if (v.auto_height == 1) {
                    height = 'auto';
                } else {
                    height = v.height_in_px + 'px';
                }
                // //debugger;
                html += `
                                <div class="col-lg-` + v.number_of_columns + ` ` + display_on_screen + `">
                                    <div class="hpanel stats box-dash">
                                        <div class="header-dash" data-link="`+v.title+`" style="color:#fff;background-color: #a50000;"><span data-link="`+v.title+`">`+v.title+`</span>
                                            
                                        </div>
                                        <div class="panel-body" style="height:` + height + `">`;
                first_column = true;
                endColumn = 0;
                lastWidget = '';
                $.each(v.widget_items, function (idx, val) {
                    // debugger;
                    if (val.widget_status != 1) {
                        if (val.widget_type == 'Section Break') {
                            if (lastWidget != '')
                                html += `</div>`;
                            html += `<div class="row" style="margin-bottom:2%;"></div>`;
                            endColumn = 0;
                            first_column = true;
                            lastWidget = '';
                            return true;

                        }
                        if (val.widget_type == 'Column Break') {
                            lastWidget = val.widget_type
                            first_column = true

                        }

                        if (lastWidget == val.widget_type) {
                            if (endColumn > 0) {
                                html += `</div>`;
                            }
                            if (first_column) {
                                html += `<div class="col-lg-` + val.number_of_columns + `">`;
                                first_column = false
                                endColumn++
                            }
                        } else {
                            html += frappe.spdashboard.chartChildContent(val)

                        }
                    }
                })
                html += `
                                </div>
                                </div>
                                <div class="footer-dash">
                                    <span id="lu_` + v.name + `">Last update: ` + last_update + `</span>
                                </div>
                            </div>
                        <!--</div>-->`;
                    }
                }
                else if(v.widget_type == 'Newsletter'){
                //debugger;
                var url = new URL(location.href)
                html += `
                <div class="col-lg-`+v.number_of_columns+` `+display_on_screen+`">
                    <div class="hpanel">
                        <div class="header-dash" data-link="`+v.title+`" style="color:#fff;background-color: #a50000;">` + v.title + `
                                                
                                        </div>
                        <div class="panel-body" style="height:`+v.height_in_px+`px;">
                                 
                            
                            <div style="margin-top: 6px;">
                                
                                <div id="newscontent_`+v.name+`"></div>
                                <a href="`+ url.href +`#newsletterlist" data-link="see_all" target="_blank" class="btn btn-primary btn-sm pull-right">See All</a>
                            </div>
                        </div>
                    </div>
                    <div class="footer-dash">
                                    <span id="lu_` + v.name + `">Last update: ` + last_update + `</span>
                                </div>
                </div>`;
                }
                else if(v.widget_type == 'Company Info'){
                //debugger;
                html += `
                <div class="col-lg-`+v.number_of_columns+` `+display_on_screen+`">
                    <div class="hpanel">
                        <div class="header-dash" data-link="`+v.title+`" style="color:#fff;background-color: #a50000;">` + v.title + `
                                                
                                        </div>
                        <div class="panel-body" style="height:`+v.height_in_px+`px;">
                                 
                            
                            <div style="margin-top: 6px;">
                                
                                <div id="companyinfo_`+v.name+`"></div>
                            </div>
                        </div>
                    </div>
                    <div class="footer-dash">
                                    <span id="lu_` + v.name + `">Last update: ` + last_update + `</span>
                                </div>
                </div>`;
                }
                else if(v.widget_type == 'Login Activity' || v.widget_type == 'Active Project'){
                // debugger;
                    if (v.widget_type == 'Active Project'){
                        var scroll = 'style="height: 375px;overflow-y: scroll;"';
                        var head ='<div><table class="table" style="margin: 0 !important;"><tbody><tr style="background: white;"><td class="font-bold " style="color: #404040;border-top: none;">PROJECT NAME</td><td style="color: #404040;border-top: none;text-align: center;" class="font-bold ">START DATE</td><td style="color: #404040;border-top: none;text-align: right;" class="font-bold ">END DATE</td></tr></tbody></table></div>';
                    }
                    else {
                        var scroll = '';
                        var head ='';
                    }
                html += `
                <div class="col-lg-`+v.number_of_columns+` `+display_on_screen+`">
                    <div class="hpanel">
                        <div class="header-dash" style="color:#fff;background-color: #a50000;" data-link="`+v.title+`">` + v.title + `
                                                
                                        </div>
                        <div class="panel-body" style="height:`+v.height_in_px+`px;">
                             `+head+`    
                            
                            <div style="margin-top: 6px;">
                                
                                
                                <div id="companyinfo_`+v.name+`" `+scroll+`></div>
                                
                            </div>
                        </div>
                    </div>
                    <div class="footer-dash">
                                    <span id="lu_` + v.name + `">Last update: ` + last_update + `</span>
                                </div>
                </div>`;
                }else{
                    html += `<div class="col-lg-`+v.number_of_columns+` `+display_on_screen+`">
                            <div class="hpanel box-dash">
                                <div class="header-dash" style="color:#fff;background-color: #a50000;" > <span data-link="`+v.title+`">`+v.title+`</span>
                                    <span id="cf_`+v.name+`"></span>
                                </div>
                                <div class="panel-body">`
                                    if (v.widget_type!="Pie" && v.widget_type == "Counter5") {
                                        html += `<div class="header-dash" style="color:#000 !important;background:none !important;text-align: center;" data-link="`+v.title+`">Values in Thousands</div>`
                                    }
                                    if (v.button_add == 1){
                                        if (v.title == 'Top Five Selling Items') {
                                            // debugger;
                                            var get_value = JSON.stringify(v);
                                            var filters1 = JSON.stringify({"add_button": "1"});
                                            chartDataQuantityForTopSellingItem = JSON.stringify(frappe.spdashboard.getChartData(v.dotted_path, filters1, v.name));
                                            var filters2 = JSON.stringify({"add_button": "0"});
                                            chartDataAmountForTopSellingItem = JSON.stringify(frappe.spdashboard.getChartData(v.dotted_path, filters2, v.name));


                                            html += `<div class="btn-group" style="margin-left: 50%;" role="group" aria-label="Basic example">
                                                  <button type="button" class="btn btn-primary quantity_call b1" value = "0" method='` + get_value + `'  chartDataAmount='`+chartDataAmountForTopSellingItem+`'  >Amount</button>
                                                   <button type="button" class="btn btn-info quantity_call a1"  value = "1" method='` + get_value + `'  chartDataQuantity='`+chartDataQuantityForTopSellingItem+`'  >Quantity</button>
                                                  
                                                </div>`
                                        }
                                        else if (v.title == 'Top Five Stock Items'){
                                            // debugger;
                                            var get_value = JSON.stringify(v);
                                            var filters3 = JSON.stringify({"add_button": "1"});
                                            chartDataQuantityForTopStockItem = JSON.stringify(frappe.spdashboard.getChartData(v.dotted_path, filters3, v.name));
                                            var filters4 = JSON.stringify({"add_button": "0"});
                                            chartDataAmountForTopStockItem = JSON.stringify(frappe.spdashboard.getChartData(v.dotted_path, filters4, v.name));

                                            html += `<div class="btn-group" style="margin-left: 50%;" role="group" aria-label="Basic example">
                                                  <button type="button" class="btn btn-primary quantity_call2 b2" value = "0" method='` + get_value + `' chartDataAmount='`+chartDataAmountForTopStockItem+`' >Amount</button>
                                                   <button type="button" class="btn btn-info quantity_call2 a2"  value = "1" method='` + get_value + `' chartDataQuantity='`+chartDataQuantityForTopStockItem+`'>Quantity</button>
                                                  
                                                </div>`
                                        }

                                     }
                                    if (v.title == 'Project Wise Monthly Income And Expense'){
                                        debugger;
                                        var get_value = JSON.stringify(v);
                                        if (v.last_filters.length > 0) {
                                            var filter_project = v.last_filters[0].add_selector;
                                        }
                                        else{
                                            var filter_project = ''
                                        }
                                        var project_id = ''
                                        var data_name = ''
                                        var data_id = ''
                                        if (filter_project != '' && filter_project != undefined)
                                        {
                                            project_id = JSON.parse(v.last_filters[0].add_selector).add_selector.split(",")[0]
                                            data_name = JSON.parse(v.last_filters[0].add_selector).add_selector.split(",")[1]
                                            data_id =JSON.parse(v.last_filters[0].add_selector).add_selector.split(",")[0]
                                        }
                                        chartDataForProjectWise = JSON.stringify(frappe.spdashboard.getChartData(v.dotted_path, filter_project, v.name));
                                        select_box = `<option method='`+ get_value +`'chartDataAmount='`+chartDataForProjectWise +`' filter='`+filter_project +`' data-name='`+ data_name +`' value="`+ data_id+`">`+data_name+`</option>`;

                                        frappe.call({
                                                method: 'spdashboard.sp_dashboard.page.dashboard1.dashboard1.list_of_project',
                                                async: false,
                                                args: {
                                                    'project_id': project_id
                                                },
                                                callback(r) {
                                                    debugger;
                                                    if (r.message) {
                                                        r.message.forEach(function(v,k) {
                                                            var project_filter_array = {}
                                                                project_filter_array = {
                                                                    'add_selector': v.name+","+v.project_name
                                                                }
                                                            var filter_select_project = JSON.stringify(project_filter_array);
                                                            chartDataForProjectWise = JSON.stringify(frappe.spdashboard.getChartData(v.dotted_path, filter_select_project, v.name));

                                                            select_box += `<option method='`+ get_value +`' filter='`+filter_select_project +`' chartDataAmount='`+chartDataForProjectWise +`' data-name='`+v.project_name+`' value="`+v.name +`">`+v.project_name+`</option>`
                                                        });
                                                    }
                                                }
                                            })

                                            html += `<div class="btn-group" style="margin-left: 50%;" role="group" aria-label="Basic example"><label for="cars">CHOOSE A PROJECT:</label>
                                                        <select id="project">
                                                        `+select_box +`
                                                        </select></div>`


                                    }

                                    html+=`<div id="`+v.name+`" style="height:`+v.height_in_px+`px;" ></div>
                                </div>
                                <div class="footer-dash"> <span id="lu_`+v.name+`">Last update: `+last_update+` </span> </div>
                            </div>
                        </div>`;
                }
        // //debugger;
        return html;
    },
    chartChildContent: function(v){

        html = ``;
        var currency = '';
        var display_on_screen = '';
        var counterClass = '';
        if(v.currency){
            currency = 'AED'
            counterClass = 'countCurrency'
        }else{
            counterClass = 'countItem'
        }

        if(v.display_on_screen == 'Web'){
            display_on_screen = 'web';
        }else if(v.display_on_screen == 'Mobile'){
            display_on_screen = 'mobile';
        }

        if(v.widget_type == 'Range'){
                    html += `<div class="col-lg-`+v.number_of_columns+` `+display_on_screen+`">
                                <div class="header-dash" style="color:#000 !important;background:none !important;" data-link="`+v.title+`">`+v.title+`</div>
                                <div class="panel-body" style="border:0px;height:`+v.height_in_px+`px;padding:0px !important;">
                                    <div class="progress m-t-xs full progress-small">
                                        <div id="progress_`+v.name+`" class=" progress-bar progress-bar-success"></div>
                                    </div>
                                    <div class="row" id="range_`+v.name+`"></div>
                                </div>
                            </div>`
                }
                else if(v.widget_type == 'Counter1'){
                    html += `<div class="col-lg-`+v.number_of_columns+` `+display_on_screen+`">
                                    <div class="header-dash" style="color:#000 !important;background:none !important;">`+v.title+`</div>
                                    <div class="panel-body" style="border:0px;height:`+v.height_in_px+`px;">
                                        <div>
                                            <div class="row">
                                                <label style="margin-left: 10px;margin-top: 20px;margin-bottom: 0px;" data-link="Total Amount">Total Amount</label>
                                                <h1 style="margin-left: 10px;margin-top: 10px;margin-bottom: -10px;font-weight: 200;font-size: 36px" class="color-dash">`+currency+` <span class="countCurrency"><span id="value_`+v.name+`"></span></span></h1>
                                            </div>
                                        </div>
                                    </div>
                                </div>`

                }else if(v.widget_type == 'Counter2'){
                    html += `<div class="col-lg-`+v.number_of_columns+` `+display_on_screen+`">
                                    <div class="header-dash" style="color:#000 !important;background:none !important;">`+v.title+`</div>
                                    <div class="panel-body" style="border:0px;height:`+v.height_in_px+`px;">
                                        <div class="list-item-container">
                                            <div class="list-item2" style="border: none!important;"><h3 class="countCurrency no-margins font-extra-bold color-dash "
                                                                        style="font-size: 40px;"><span id="value_`+v.name+`"></span></h3>
                                                <small  style="font-size: 15px;">No of Items</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>`

                }else if(v.widget_type == 'Counter3'){
                    html += `<div class="col-lg-`+v.number_of_columns+` `+display_on_screen+`">
                                <div class="header-dash" style="color:#000 !important;background:none !important;">`+v.title`+</div>
                                <div class="panel-body" style="border:0px;height:`+v.height_in_px+`px;">
                                    <div class="list-item-container">
                                        <div class="list-item2" style="border: none!important;"><h3 class="no-margins font-extra-bold text-color3"
                                                                    style="font-size: 40px;">`+currency+` <span class="`+counterClass+`" id="countCurrency"><span id="value_`+v.name+`"></span></span></h3>
                                            <small  style="font-size: 15px;">Total Stock Value</small>
                                        </div>
                                    </div>
                                </div>
                            </div>`
                }else if(v.widget_type == 'Counter4'){
                    // debugger;
                    var href_path = ""
                    if (v.title == 'Draft') {
                        if (frappe.user.has_role('Snap Process') == false) {
                            href_path = "#"
                        }
                        else {
                            href_path = "#snapprocesslist?id="+v.title
                        }
                    }
                    else {
                            href_path = "#snapprocesslist?id="+v.title
                        }
                    html += `
                    <div class="col-lg-`+v.number_of_columns+` `+display_on_screen+`">
                        <a href="`+href_path+`" >
                            <!--<div class="solTitle" onclick="locationChange('`+href_path+`',1)">-->
                            <div class="hpanel">
                                <div class="panel-body" style="border: none; height:`+v.height_in_px+`px;">
                                    <div class="pull-left" style="width: 30%;">
                                        <i class="`+v.icon+` fa-4x"></i>
                                    </div>
                                     <div style="margin-top: 6px;"  >
                                        <label style="color: #A5000C;margin-bottom: 0px;font-size: 20px;">`+currency+` <span class="`+counterClass+`" id="countCurrency"><span id="value_`+v.name+`"></span></span></label>
                                        <br>
                                        <small data-link="`+v.title+`">
                                             `+v.title+`
                                             <span id="cf_`+v.name+`"></span>
                                        </small>
                                    </div>
                                </div>
                            </div><hr style="margin: 0px;">
                            <!--</div>-->
                            </a>
                        </div>`;
                }
                else if(v.widget_type == 'Newsletter'){
                    //debugger;
                    html += `
                    <div class="col-lg-`+v.number_of_columns+` `+display_on_screen+`">
                        <div class="hpanel">
                            <div class="panel-body" style="height:`+v.height_in_px+`px;">
                                <div class="pull-left" style="width: 30%;">
                                    <i class="`+v.icon+` fa-4x"></i>
                                </div>
                                <div style="margin-top: 6px;">
                                    <label style="color: #A5000C;margin-bottom: 0px;font-size: 20px;">`+currency+` <span class="`+counterClass+`" id="countCurrency"><span id="value_`+v.name+`"></span></span></label>
                                    <br>
                                    <small>
                                         `+v.title+`
                                         <span id="cf_`+v.name+`"></span>
                                    </small>
                                    <div id="newscontent_`+v.name+`"></div>
                                </div>
                            </div>
                        </div>
                    </div>`;
                }
                else{
                    if (v.title == 'Total Sales') {
                        htmlTag = `<div class="header-dash" style="color:#000 !important;background:none !important;"><p style="display: inline;float: left;margin: auto;" data-link="`+v.title+`">`+v.title+` </p><p style="text-align: center;margin: auto;"  data-link="Values-`+v.title+`">Values In Thousands</p></div>`
                    } else {
                        htmlTag = `<div class="header-dash" style="color:#000 !important;background:none !important;" data-link="`+v.title+`">`+v.title+`</div>`
                    }
                    html += `<div class="col-lg-`+v.number_of_columns+` `+display_on_screen+`">
                                `+ htmlTag +`
                                <div class="panel-body" style="border:0px !important; padding:0px !important;">
                                    <div id="`+v.name+`" style="height:`+v.height_in_px+`px; padding:0px !important" ></div>
                                </div>
                            </div>`;
                }
        return html;

    },
    quantity:function(){
        $('.quantity_call').on('click', function () {
            // debugger;
            var v = JSON.parse(($(this).attr('method')));
            var check_value = $(this).val();
            if (check_value == "1") {
                $('.a1').removeClass('btn-primary','btn-info');
                $('.b1').removeClass('btn-primary','btn-info');
                $('.a1').addClass('btn-primary');
                $('.b1').addClass('btn-info');
                // var filters = JSON.stringify({"add_button": "1"});
                var chartData = JSON.parse(($(this).attr('chartDataQuantity')));

            }
            else if (check_value == "0"){
                $('.a1').removeClass('btn-primary','btn-info');
                $('.b1').removeClass('btn-primary','btn-info');
                $('.b1').addClass('btn-primary');
                $('.a1').addClass('btn-info');
                // var filters = JSON.stringify({"add_button": "0"});
                var chartData = JSON.parse(($(this).attr('chartDataAmount')));
            }

            frappe.spdashboard.getCharts(
                v.name,
                v.title,
                v.widget_type,
                // frappe.spdashboard.getChartData(v.dotted_path, filters, v.name),
                chartData,
                v.dotted_path,
                false,
                v.widget_items
            )

        })
        // debugger;
        if ($( ".btn-primary" ).hasClass( "b1" ) == true){
            var v = JSON.parse(($('.b1').attr('method')));
            // var filters = JSON.stringify({"add_button": "0"});
            var chartData1 = JSON.parse(($('.b1').attr('chartDataAmount')));
            frappe.spdashboard.getCharts(
                v.name,
                v.title,
                v.widget_type,
                // frappe.spdashboard.getChartData(v.dotted_path, filters, v.name),
                chartData1,
                v.dotted_path,
                false,
                v.widget_items
            )
        }
        else if ($( ".btn-primary" ).hasClass( "a1" ) == true){
            var v = JSON.parse(($('.a1').attr('method')));
            // var filters = JSON.stringify({"add_button": "1"});
            var chartData2 = JSON.parse(($('.a1').attr('chartDataQuantity')));
            frappe.spdashboard.getCharts(
                v.name,
                v.title,
                v.widget_type,
                // frappe.spdashboard.getChartData(v.dotted_path, filters, v.name),
                chartData2,
                v.dotted_path,
                false,
                v.widget_items
            )

        }

    },
    quantity1:function(){
        // debugger;
        $('.quantity_call2').on('click', function () {
            // debugger;

            var v = JSON.parse(($(this).attr('method')));
            var check_value = $(this).val();
            if (check_value == "1") {
                $('.a2').removeClass('btn-primary','btn-info');
                $('.b2').removeClass('btn-primary','btn-info');
                $('.a2').addClass('btn-primary');
                $('.b2').addClass('btn-info');
                // var filters = JSON.stringify({"add_button": "1"});
                var chartData = JSON.parse(($(this).attr('chartDataQuantity')));
            }
            else if (check_value == "0"){
                $('.a2').removeClass('btn-primary','btn-info');
                $('.b2').removeClass('btn-primary','btn-info');
                $('.b2').addClass('btn-primary');
                $('.a2').addClass('btn-info');
                // var filters = JSON.stringify({"add_button": "0"});
                var chartData = JSON.parse(($(this).attr('chartDataAmount')));
            }

            frappe.spdashboard.getCharts(
                v.name,
                v.title,
                v.widget_type,
                chartData,
                // frappe.spdashboard.getChartData(v.dotted_path, filters, v.name),
                v.dotted_path,
                false,
                v.widget_items
            )

        })
        if ($( ".btn-primary" ).hasClass( "b2" ) == true){
            var v = JSON.parse(($('.b2').attr('method')));
            // var filters = JSON.stringify({"add_button": "0"});
            var chartData1 = JSON.parse(($('.b2').attr('chartDataAmount')));
            frappe.spdashboard.getCharts(
                v.name,
                v.title,
                v.widget_type,
                // frappe.spdashboard.getChartData(v.dotted_path, filters, v.name),
                chartData1,
                v.dotted_path,
                false,
                v.widget_items
            )
        }
        else if ($( ".btn-primary" ).hasClass( "a2" ) == true){
            var v = JSON.parse(($('.a2').attr('method')));
            // var filters = JSON.stringify({"add_button": "1"});
            var chartData1 = JSON.parse(($('.a2').attr('chartDataQuantity')));
            frappe.spdashboard.getCharts(
                v.name,
                v.title,
                v.widget_type,
                chartData1,
                // frappe.spdashboard.getChartData(v.dotted_path, filters, v.name),
                v.dotted_path,
                false,
                v.widget_items
            )

        }


    },
    selector_project:function(){
        debugger;
         $('#project').on('change', function () {
            var v = JSON.parse(($('option:selected', this).attr('method')));
            var chartDataproject = JSON.parse(($('option:selected', this).attr('chartDataAmount')));
            var filter_pro =  $('option:selected', this).attr('filter')
            frappe.spdashboard.getCharts(
                v.name,
                v.title,
                v.widget_type,
                chartDataproject,
                frappe.spdashboard.getChartData(v.dotted_path, filter_pro, v.name),
                v.dotted_path,
                false,
                v.widget_items
            )

         });
        // alert("ahsan");
    //     frappe.call({
    //     method: 'spdashboard.sp_dashboard.page.dashboard1.dashboard1.list_of_project',
    //     async: false,
    //     callback(r) {
    //         debugger;
    //         if (r.message) {
    //             html = `<option value=""></option>`;
    //             r.message.forEach(function(v,k) {
    //                 html += `<option value="`+v.name +`">`+v.project_name+`</option>`
    //             });
    //             $('#project').html(html);
    //         }
    //     }
    // })
    },
    renderCharts:function(page,enabledCharts){
        // debugger;
        let column = 0;
        let f_row = true;
        let html = '';
        html += frappe.spdashboard.navigation()
        let rowCheck = false;

        enabledCharts.forEach(function(v,k){
            // debugger;
            if(f_row){
                html += '<div class="row" style="margin-bottom:2%;">';
            }
            column += parseInt(v.number_of_columns)

            if(column > 12){
                rowCheck = true
                column = 0;
                column += parseInt(v.number_of_columns)
                if (v.widget_type == 'Active Project'){
                    column = 0;
                    rowCheck = false
                }

            }

            if(!rowCheck){
                html += frappe.spdashboard.chartContent(v)

            }
            // //debugger;
            if(rowCheck){
                html += `</div>
                        <div class="row" style="margin-bottom:2%;">`;
                html += frappe.spdashboard.chartContent(v)

                rowCheck = false;
            }

            f_row = false;
        })
        // //debugger;
        html += ' </div>';

        page.main.append(html);

        enabledCharts.forEach(function(v,k){
            frappe.spdashboard.getCharts(
                        v.name,
                        v.title,
                        v.widget_type,
                        frappe.spdashboard.getChartData(v.dotted_path,null,v.name),
                        v.dotted_path,
                        false,
                        v.widget_items
                    )
            frappe.spdashboard.refreshChart(v.refresh_rate.split('s')[0],
                        v.name,
                        v.title,
                        v.widget_type,
                        v.dotted_path
                    );
        })


//        frappe.spdashboard.filterChanged()
        frappe.spdashboard.initCounter()
    },
    initCounter: function() {

        var options = {
            useEasing: true,
            useGrouping: true,
            separator: ',',
            decimal: '.',
        };

        $('.countCurrency span').each(function(k,v){
            var check_split=v.outerHTML.split('<span id="');
            check_split2 = check_split[1].split('">');
            endVal = v.innerHTML.replace(",", "")
            if (check_split2[0] == 'value_Chart000026' || check_split2[0] == 'value1_Chart000026' || check_split2[0] == 'value2_Chart000026') {
                var demo = new CountUp(v, 0, parseInt(endVal), 0, 5, options);
            }
            else{
                var demo = new CountUp(v, 0, parseInt(endVal), 2, 5, options);
            }
            if (!demo.error) {
                demo.start();
            } else {
                console.error(demo.error);
            }
        })

        $('.countItem span').each(function(k,v){
            endVal = v.innerHTML.replace(",", "")
            var demo = new CountUp(v, 0, parseInt(endVal), 0, 5, options);
            if (!demo.error) {
                demo.start();
            } else {
                console.error(demo.error);
            }
        })
    },
    getEnabledCharts: function(){
        let chartlist=null;
        frappe.call({
             method: "spdashboard.sp_dashboard.page.dashboard1.dashboard1.getEnabledCharts",
             args: {

             },
             async:false,
             callback(r) {
                if(r.message.length > 0)
                   chartlist = r.message;
             }

        })
        return chartlist
    },
    getChartData: function(path,filters=null,chartid=null){
        let chartData=null;
        frappe.call({
             method: path,
             args: {
                "chartid":chartid,
                "filters":filters
             },
             async:false,
             callback(r) {
                if(r.message.length > 0 || r.message)
                   chartData = r.message;
             }
        })
        return chartData
    },
    getCharts: function(chartid,label,type,chartData,path=null,update=false,child_widgets=null){
        // debugger;
        if(update == false){
             filters = frappe.spdashboard.renderFilters(chartid,label,type,chartData.filters,path)
        }
        if(type == 'Pie'){
            echarts.init(document.getElementById(chartid)).setOption({
//                title: {text: label},
                tooltip : {
                    trigger: 'item',
                    formatter: "{b} : {c} ({d}%)"
                },
                legend: {
                    orient: 'vertical',
                    left: 'left',
                    data: chartData.labels
                },
                series: {
                    type: 'pie',
                    radius : '75%',
                    data: chartData.values
//                    data: [
//                        {name: 'A', value: 1212},
//                        {name: 'B', value: 2323},
//                        {name: 'C', value: 1919}
//                    ]
                }
            });
            // debugger;
            // if (chartid == 'Chart000006') {
            //     echarts.init(document.getElementById(chartid)).on('click', function () {
            //         frappe.set_route("query-report", "Stock Ledger", {
            //             from_date: chartData.start_date,
            //             to_date: chartData.end_date
            //         });
            //     });
            // }
            // if (chartid == 'Chart000007') {
            //     echarts.init(document.getElementById(chartid)).on('click', function () {
            //     frappe.set_route("query-report", "Item-wise Sales Register", {
            //         from_date: chartData.start_date,
            //         to_date: chartData.end_date
            //     });
            // });
            // }
        }
        else if(type == 'Line'){
            echarts.init(document.getElementById(chartid)).setOption({
//                title: {text: label},
                tooltip : {
                    trigger: 'item',
                    formatter: "{b} : {c}"
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: chartData.labels
//                    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
                },
                yAxis: {
                    type: 'value'
                },
                series: [{
                    data: chartData.values,
//                    data: [100, 932, 901, 934, 1290, 1330, 1320],
                    type: 'line'
                }]
            });
        }
        else if(type == 'Area') {
            var mychart1 = echarts.init(document.getElementById(chartid))
            var option = {
//                title: {text: label},
                tooltip: {
                    trigger: 'item',
                    formatter: "{b} : {c}"
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: chartData.labels
//                    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
                },
                yAxis: {
                    type: 'value'
                },
                series: [{
                    data: chartData.values,
//                    data: [100, 932, 500, 934, 600, 1330, 1000],
                    type: 'line',
                    lineStyle: {
                        color: '#c0392b',
                    },
                    areaStyle: {
                        color: '#c0392b',
                        shadowColor: 'black',
                        shadowBlur: 20
                    }
                }]
            }
            mychart1.setOption(option, true);
            mychart1.on('click', function (params) {
                // var name = params.name;
                // let [start_date, end_date] = frappe.spdashboard.get_startDate_endDate(name);

                // FOR CHART Total sales summary Chart000009 //
                if (chartid == 'fd314887e1') {
                    frappe.set_route("query-report", "Sales Register", {
                        from_date: chartData.start_date,
                        to_date: chartData.end_date
                    });
                }
            });
        }
        else if(type == 'Bar'){
            // debugger;
            var ar_expense=[]
            if (user_lang == 'ar') {
                if (chartData.legends[0] == 'Income'){
                    ar_expense=['الإيرادات','مصروف']
                    chartData.series[0].name='مصروف'
                    chartData.series[1].name='الإيرادات'

                }
            }
            else{
                ar_expense=chartData.legends
            }

            var mychart = echarts.init(document.getElementById(chartid))
            var options = {
//                 title: {text: 'Bar Chart'},
                legend: {
//                    orient: 'vertical',
//                    left: 'left',
                    componentType: 'series',
                    seriesType: 'bar',
                    name: chartid,
                    // data: chartData.legends
                    data: ar_expense
                },
                tooltip: {},
//                dataset: {
////                    source: [
////                        ['product', 'Matcha Latte', 'Milk Tea', 'Cheese Cocoa','Walnut Brownie'],
////                        ['2015', 43.3, 85.8, 93.7, 72.4],
////                        ['2016', 83.1, 73.4, 55.1, 53.9],
////                        ['2017', 86.4, 65.2, 82.5, 39.1]
////                    ]
//                    source: chartData.values
//                },
                xAxis: {
                    type: 'category',
                    data: chartData.labels
                },
                yAxis: {
                    type: 'value'
                },
                // Declare several bar series, each will be mapped
                // to a column of dataset.source by default.
                series: chartData.series
//                series: [
//                    {"type": "bar"},
//                    {"type": "bar"},
//                    {"type": "bar"},
//                    {"type": "bar"}
//                ]
            }
            mychart.setOption(options);
            mychart.on('click', function (params) {

                    var name = params.name;
                    let [start_date, end_date] = frappe.spdashboard.get_startDate_endDate(name);

                    // FOR CHART Monthly Purchase
                    if (chartid == 'Chart000003') {
                       frappe.set_route("query-report", "Purchase Register", {
                            from_date: start_date,
                            to_date: end_date
                        });
                    }
                     // FOR CHART Monthly Sales
                    if (chartid == 'Chart000002') {
                        // echarts.init(document.getElementById(chartid)).on('click', function () {
                            frappe.set_route("query-report", "Sales Register", {
                                from_date: start_date,
                                to_date: end_date
                            });
                        // });
                    }
                });

        }else if(type == 'Range'){
            value_boxes = ``
            $('#progress_'+chartid).css('width',chartData.values.totalpercent+'%')
            $.each(chartData.values.percent,function(k,v){
                value_boxes += `<div class="col-xs-6">
                                <small class="stats-label" data-link="`+k+`">`+k+`</small>
                                <h4>`+v+`%</h4>
                            </div>`;
            })
            $('#range_'+chartid).html(value_boxes)

        }else if(type == 'Counter1'){
            $('#value_'+chartid).html(chartData.values)
        }else if(type == 'Counter2'){
            $('#value_'+chartid).html(chartData.values)
        }else if(type == 'Counter3'){
            $('#value_'+chartid).html(chartData.values)
        }else if(type == 'Counter4'){
            $('#value_'+chartid).html(chartData.values)
        }else if(type == 'Counter5'){
            // debugger;
            $('#value_'+chartid).html(parseInt(chartData.values['sms_count']))
            $('#value1_'+chartid).html(parseInt(chartData.values['paid_sms']))
            $('#value2_'+chartid).html(parseInt(chartData.values['free_sms']))
        }
        else if(type == 'Custom'){
            if(child_widgets.length > 0){
                $.each(child_widgets,function(k,v){
                    if(v.widget_status != 1){
                        frappe.spdashboard.getCharts(v.name,
                                                        v.title,
                                                        v.widget_type,
                                                        frappe.spdashboard.getChartData(v.dotted_path,chartData.last_filters,v.name),
                                                        v.dotted_path,
                                                        true)
                    }

                })
            }
        }else if(type == 'Snap & Post'){
            if (child_widgets != null) {
                if(child_widgets.length > 0){
                    $.each(child_widgets,function(k,v){
                        if(v.widget_status != 1){
                            frappe.spdashboard.getCharts(v.name,
                                v.title,
                                v.widget_type,
                                frappe.spdashboard.getChartData(v.dotted_path,chartData.last_filters,v.name),
                                v.dotted_path,
                                true)
                        }

                    })
                }
            }
        }else if(type == 'Newsletter'){
            // debugger;
            var htmlContent = ''
            $.each(chartData.values,function(k,v){
                var noBorder = (k == 3) ? 'no-border' : ''
                var image = (v.image != null) ? v.image : 'http://mavensolutions.net/Lead2/no_image.jpg'
                var url = new URL(location.href)
                var curDate = new Date(v.date)
                var newsletterDate = curDate.getDate() + '-' + (curDate.getMonth()+1) + '-' + curDate.getFullYear()
                var nlurl = url.href
                var title = v.title.replace(/ /g,'-')
                var nltitle = (v.title.length > 30) ? v.title.slice(0,30)+'...' : v.title
                var message = v.content.replace(/(<([^>]+)>)/ig,"")
                var content = (message.length > 100)?message.slice(0,100)+'...' :message
                ///////////////////////////////////////////////////
                  var color_change = ''
                 frappe.call({
                        method:'spdashboard.sp_dashboard.page.dashboard1.dashboard1.color_change_newsletter',
                        args:{
                            id:v.name
                        },
                        async: false,
                        callback(r) {
                        // debugger;
                        if (r.message == true) {
                            color_change = '#404040; text-decoration: underline;'

                        }
                        else{
                            color_change = '#a50000'
                        }
                       }
                    })

                //////////////////////////////////////////////////

                htmlContent += '    <a target="_blank" style="text-decoration: none" href="'+ nlurl +'#newslettersingle/'+ v.name +'"><div class="social-talk '+noBorder+'">\n ' +
                    '<div class="media social-profile clearfix">\n ' +
                    '<div class="pull-left">' +
                    '<img src="'+ image +'">' +
                    '</div>' +
                    '<div class="media-body">' +
                    '<span class="font-bold" style="color:'+color_change+'">'+nltitle+'</span>' +
                    '<small class="text-muted pull-right">'+newsletterDate+'</small>' +
                    '<div class="social-content">'+content+'</div>' +
                    '</div></div>   </div></a>'
                // htmlContent +="<div>" +
                //     "<a target='_blank' href='"+ nlurl +"#newslettersingle/"+ title +"'>" +
                //     "<p>"+v.title+"</p>" +
                //     "<p>"+content+"</p>" +
                //     "<p>"+v.date+"</p>" +
                //     "</a>" +
                //     "<div/>"
                // $('#newscontent_'+chartid).append("<div><p>"+v.title+"</p><p>"+v.content+"</p><p>"+v.date+"</p><div/>")
            });
            $('#newscontent_'+chartid).html(htmlContent)
        }else if(type == 'Company Info'){
            // debugger;
            http://localhost:8000/desk#Form/Company/Skylines%20Solution11
            var url = new URL(location.href)
            var curDate = new Date(chartData.values.contract_start_date)
            var ContractDate = curDate.toLocaleString('en-GB', {day:'2-digit', month:'2-digit', year:'numeric'})
            var companyOverView = (chartData.values.company_over_view.length > 300) ? chartData.values.company_over_view.slice(0,300) + '... <a target="_blank" href="'+ url.href +'#Form/Company/'+ chartData.values.name +'"><b style="color: #bdbfc1;">Read More</b></a>' : chartData.values.company_over_view
            var htmlContent = '<div>\n' +
                '   <h2 style="font-size: 25px;color: #a50000">'+ chartData.values.name +'</h2>\n' +
                '   <b data-link="TRN">TRN #</b> '+ chartData.values.trn +'<br> \n' +
                '   <br>\n' +
                '   <b data-link="Auditor_Name">Auditor Name</b> '+ chartData.values.auditor_name +'<br>\n' +
                '   <b data-link="Email">Email:</b> '+ chartData.values.email +'<br>\n' +
                '   <br>\n' +
                '   <b data-link="Contract_Start_Date">Contract Start Date:</b> '+ ContractDate +'<br>\n' +
                '   <b data-link="Customer_Type">Customer Type:</b> '+ chartData.values.customer_type +'<br>\n' +
                '   <br>\n' +
                '   <b data-link="Description">Description:</b>\n' +
                '   <p>\n' + companyOverView +
                '   </p>\n' +
                '</div>'
            // $.each(chartData.values,function(k,v){
                // var noBorder = (k == 3) ? 'no-border' : ''
                // var image = (v.image != null) ? v.image : 'http://mavensolutions.net/Lead2/no_image.jpg'
                // var url = new URL(location.href)
                // var curDate = new Date(v.date)
                // var newsletterDate = curDate.getDate() + '-' + (curDate.getMonth()+1) + '-' + curDate.getFullYear()
                // var nlurl = url.href
                // var title = v.title.replace(/ /g,'-')
                // var nltitle = (v.title.length > 30) ? v.title.slice(0,30)+'...' : v.title
                // var message = v.content.replace(/(<([^>]+)>)/ig,"")
                // var content = (message.length > 100)?message.slice(0,100)+'...' :message


                // htmlContent +="<div>" +
                //     "<a target='_blank' href='"+ nlurl +"#newslettersingle/"+ title +"'>" +
                //     "<p>"+v.title+"</p>" +
                //     "<p>"+content+"</p>" +
                //     "<p>"+v.date+"</p>" +
                //     "</a>" +
                //     "<div/>"
                // $('#newscontent_'+chartid).append("<div><p>"+v.title+"</p><p>"+v.content+"</p><p>"+v.date+"</p><div/>")
            // });
            $('#companyinfo_'+chartid).html(htmlContent)
        }
        else if((type == 'Login Activity') || (type == 'Active Project')) {
            // debugger;
            if (type == 'Login Activity') {
                var htmlContent = '<table class="table table-striped"><tbody>'
                $.each(chartData.values, function (k, v) {
                    var name = (v.full_name.length > 20) ? v.full_name.slice(0, 20) + '...' : v.full_name
                    var curDate = new Date(v.communication_date)
                    var newsletterDate = curDate.toLocaleString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                        second: 'numeric',
                        hour12: true
                    })
                    var truncateName = v.full_name
                    if (truncateName.length > 13) {
                        truncateName = truncateName.substring(0, 13) + '...'
                    }
                    htmlContent += '<tr>\n' +
                        '                                    <td>\n' +
                        '                                        <span class="font-bold " title="' + v.full_name + '" style="color: #a50000;">' + truncateName + '</span>\n' +

                        '                                    </td>\n' +
                        '                                    <td class="rtl-ltr">' + newsletterDate + '</td>\n' +
                        '                                </tr>'

                })
                htmlContent += '</tbody></table>'
            }
            if (type == 'Active Project') {
                // debugger;
                 var htmlContent = '<table class="table table-striped"><tbody>'
                $.each(chartData.values, function (k, v) {
                    var name = (v.project_name.length > 20) ? v.project_name.slice(0, 20) + '...' : v.project_name
                    // var name = v.project_name
                    var startdate = new Date(v.exp_start_date)
                    var newsletterstartDate = startdate.toLocaleString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                        // hour: 'numeric',
                        // minute: 'numeric',
                        // second: 'numeric',
                        // hour12: true
                    })
                    var enddate = new Date(v.exp_end_date)
                    var newsletterendDate = enddate.toLocaleString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                        // hour: 'numeric',
                        // minute: 'numeric',
                        // second: 'numeric',
                        // hour12: true
                    })
                    var truncateName = v.project_name
                    if (truncateName.length > 13) {
                        truncateName = truncateName.substring(0, 13) + '...'
                    }
                    htmlContent += '<tr>\n' +
                        '                                    <td>\n' +
                        '                                        <span class="font-bold " title="' + v.project_name + '" style="color: #a50000;">' + truncateName + '</span>\n' +

                        '                                    </td>\n' +
                        '                                    <td class="rtl-ltr">' + newsletterstartDate + '</td>\n' +
                        '                                     <td class="rtl-ltr">' + newsletterendDate + '</td>\n' +
                        '                                </tr>'

                })
                htmlContent += '</tbody></table>'
            }

            // $.each(chartData.values,function(k,v){
                // var noBorder = (k == 3) ? 'no-border' : ''
                // var image = (v.image != null) ? v.image : 'http://mavensolutions.net/Lead2/no_image.jpg'
                // var url = new URL(location.href)
                // var curDate = new Date(v.date)
                // var newsletterDate = curDate.getDate() + '-' + (curDate.getMonth()+1) + '-' + curDate.getFullYear()
                // var nlurl = url.href
                // var title = v.title.replace(/ /g,'-')
                // var nltitle = (v.title.length > 30) ? v.title.slice(0,30)+'...' : v.title
                // var message = v.content.replace(/(<([^>]+)>)/ig,"")
                // var content = (message.length > 100)?message.slice(0,100)+'...' :message


                // htmlContent +="<div>" +
                //     "<a target='_blank' href='"+ nlurl +"#newslettersingle/"+ title +"'>" +
                //     "<p>"+v.title+"</p>" +
                //     "<p>"+content+"</p>" +
                //     "<p>"+v.date+"</p>" +
                //     "</a>" +
                //     "<div/>"
                // $('#newscontent_'+chartid).append("<div><p>"+v.title+"</p><p>"+v.content+"</p><p>"+v.date+"</p><div/>")
            // });
            $('#companyinfo_'+chartid).html(htmlContent)

        }
    },

    get_startDate_endDate: function(name) {
        // debugger;
        var start_date = '';
        var end_date = '';
        var month = new Array();
        month['Jan'] = 0; month['Feb'] = 1; month['Mar'] = 2; month['Apr'] = 3; month['May'] = 4; month['Jun'] = 5;
        month['Jul'] = 6; month['Aug'] = 7; month['Sep'] = 8; month['Oct'] = 9; month['Nov'] = 10;month['Dec'] = 11;
        var n = month[name];
        var date = new Date();
        var firstDay = new Date(date.getFullYear(), n, 1);
        var lastDay = new Date(date.getFullYear(), n + 1, 0);

        ////////////////////first date/////////////////
        var formattedDate = new Date(firstDay);
        var d = formattedDate.getDate();
        var m = formattedDate.getMonth();
        m += 1;  // JavaScript months are 0-11
        var y = formattedDate.getFullYear();
        ////////////////////first date/////////////////

        ////////////////////last date/////////////////
        var lformattedDate = new Date(lastDay);
        var ld = lformattedDate.getDate();
        var lm = lformattedDate.getMonth();
        lm += 1;  // JavaScript months are 0-11
        var ly = lformattedDate.getFullYear();

        ////////////////////last date/////////////////
        if (m > 9){
            m = m
            lm = lm
        }
        else {
            m = "0"+m
            lm = "0"+lm
        }
        start_date = y + "-" + m + "-" + 0+d;
        end_date = ly + "-" + lm + "-" + ld;
        return [start_date, end_date]
    },

    renderFilters: function(chartid,label,type,filters,path){
        html = "";
        if(filters.length > 0) {
            if (chartid != 'Chart000026') {
                html += `<span class="fa fa-filter" onclick="frappe.spdashboard.set_filters('` + chartid + `','` + path + `','` + type + `','` + label + `')" style="float: right; margin-top: -1px; color: #fff; font-size: 25px; cursor: pointer;"></span>`
            }
            else {
                html +=''
            }
        }
        $('#cf_'+chartid).html(html);

    },
    set_filters: function (chartid,path,type,title) {
        // debugger;
        var fields = []
        var filter_values = {}
        var filter_names = []
        var chartData = frappe.spdashboard.getChartData(path,null,chartid)
        var today =
        $.each(chartData.filters,function(idx,val){
            // debugger;
            // filter_names.push(Object.keys(val)[0])
            // filter_values = {'label':Object.keys(val)[0],'fieldname': Object.keys(val)[0], 'fieldtype': 'Select','options':Object.values(val)[0].join('\n')}
            filter_names.push(Object.keys(val))
            filter_values = {'label':__("Select Filter"),'fieldname': "select_filter", 'fieldtype': 'Select','options':Object.keys(val).join('\n')}
            // filter_names.push(Object.keys(val))
            // fields.push({'label':Object.keys(val)[0],'fieldname': Object.keys(val)[0], 'fieldtype': 'Date','options':Object.values(val)[0].join('\n')});
            // fields.push({'label':Object.keys(val)[1],'fieldname': Object.keys(val)[1], 'fieldtype': 'Date','options':Object.values(val)[1].join('\n')});
            fields.push(filter_values)
        })

        fields.push({'label':__("From Date"),'fieldname': 'from_date', 'fieldtype': 'Date','depends_on':'eval:doc.select_filter=="Between"'})
        fields.push({'label':__('To Date'),'fieldname': 'to_date', 'fieldtype': 'Date','depends_on':'eval:doc.select_filter=="Between"'})

        fields.push({'label':__('Date'),'fieldname': 'less_than_date', 'fieldtype': 'Date','depends_on':'eval:doc.select_filter=="Less Than"'})
        fields.push({'label':__('Date'),'fieldname': 'greater_than_date', 'fieldtype': 'Date','depends_on':'eval:doc.select_filter=="Greater Than"'})
        fields.push({'label':__('Date'),'fieldname': 'equal_to_date', 'fieldtype': 'Date','depends_on':'eval:doc.select_filter=="Equal To"'})

        fields.push({'label':'Chart ID','fieldname': 'chart_id', 'fieldtype': 'Data','hidden':1,'default':chartid})
        fields.push({'label':'Path','fieldname': 'path', 'fieldtype': 'Data','hidden':1,'default':path})
        fields.push({'label':'Type','fieldname': 'type', 'fieldtype': 'Data','hidden':1,'default':type})
        fields.push({'label':'Title','fieldname': 'title', 'fieldtype': 'Data','hidden':1,'default':title})
        var d = new frappe.ui.Dialog({
            'title':__('Custom Filters'),
            'fields': fields,
            primary_action: function(data){
                frappe.spdashboard.filterChanged(data,filter_names)
                d.hide();
                $('.modal-title').text('مرشحات مخصصة')
            }
        });

        d.show();
        if(chartData.last_filters != null){
            // debugger;
            var last_filters = $.parseJSON(chartData.last_filters)
            $.each(last_filters,function(k,v){
                if (k == 'select_filter_custom'){
                    d.set_value('from_date',v['from_date'])
                    d.set_value('to_date',v['to_date'])
                }
                else if (k == 'select_filter_less_than'){
                    d.set_value('less_than_date',v['less_than_date'])
                }
                else if (k == 'select_filter_greater_than'){
                    d.set_value('greater_than_date',v['greater_than_date'])
                }
                else if (k == 'select_filter_equal_to_date'){
                    d.set_value('equal_to_date',v['equal_to_date'])
                }
                d.set_value(k,v)
            })
        }

    },
    filterChanged: function(data,filter_names){
        let chartid = data.chart_id
        let label = data.title
        let type = data.type
        let path = data.path
        filters={}
        filter_names.forEach(function(v,k){
            // filters[v]=data[v]
            if (data.select_filter == 'Between'){
                filters['select_filter'] = data.select_filter
                filters['select_filter_custom'] = {
                        'from_date' : data.from_date,
                        'to_date' : data.to_date,
                }
            }
            else if (data.select_filter == 'Less Than'){
                filters['select_filter'] = data.select_filter
                filters['select_filter_less_than'] = {
                        'less_than_date' : data.less_than_date
                }
            }
            else if (data.select_filter == 'Greater Than'){
                filters['select_filter'] = data.select_filter
                filters['select_filter_greater_than'] = {
                        'greater_than_date' : data.greater_than_date
                }
            }
            else if (data.select_filter == 'Equal To'){
                filters['select_filter'] = data.select_filter
                filters['select_filter_equal_to_date'] = {
                        'equal_to_date' : data.equal_to_date
                }
            }
            else {
                filters['select_filter'] = data.select_filter
            }
        })

        if(data.type == 'Custom'){

//            chartData = frappe.spdashboard.getChartData(path,{"name":chartid},chartid)
            chartData = frappe.spdashboard.getChartData(path,filters,chartid)
            $.each(chartData.widget_items,function(k,v){
                if(v.widget_status != 1){
                    if(v.widget_type != 'Column Break' && v.widget_type != 'Section Break'){
                        frappe.spdashboard.getCharts(
                            v.name,
                            v.title,
                            v.widget_type,
                            frappe.spdashboard.getChartData(v.dotted_path,filters),
                            null,
                            true
                        )
                    }
                }
            })
        }else{
            // debugger;
            frappe.spdashboard.getCharts(
                    chartid,
                    label,
                    type,
                    frappe.spdashboard.getChartData(path,filters,chartid),
                    null,
                    true
            )
        }
        debugger;
        if (label == 'Top Five Selling Items') {
            $('.a1').removeClass('btn-primary', 'btn-info');
            $('.b1').removeClass('btn-primary', 'btn-info');
            $('.a1').addClass('btn-info');
            $('.b1').addClass('btn-primary');
            //////////// filter setting //////////////////
            var filters1 = JSON.stringify({"add_button": "1"});
            chartDataQuantityForTopSellingItem = JSON.stringify(frappe.spdashboard.getChartData(path, filters1, chartid));
            $('.a1').attr('chartDataQuantity',chartDataQuantityForTopSellingItem)
            var filters2 = JSON.stringify({"add_button": "0"});
            chartDataAmountForTopSellingItem = JSON.stringify(frappe.spdashboard.getChartData(path, filters2, chartid));
            $('.b1').attr('chartDataAmount',chartDataAmountForTopSellingItem)




        }
        else if (label == 'Top Five Stock Items') {
            $('.a2').removeClass('btn-primary', 'btn-info');
            $('.b2').removeClass('btn-primary', 'btn-info');
            $('.a2').addClass('btn-info');
            $('.b2').addClass('btn-primary');
            //////////// filter setting //////////////////
            var filters3 = JSON.stringify({"add_button": "1"});
            chartDataQuantityForTopStockItem = JSON.stringify(frappe.spdashboard.getChartData(path, filters3, chartid));
            $('.a2').attr('chartDataQuantity',chartDataQuantityForTopStockItem)
            var filters4 = JSON.stringify({"add_button": "0"});
            chartDataAmountForTopStockItem = JSON.stringify(frappe.spdashboard.getChartData(path, filters4, chartid));
            $('.b2').attr('chartDataAmount',chartDataAmountForTopStockItem)

        }

    },
    updateChart: function(chartid,label,type,chartData){
            frappe.spdashboard.getCharts(
                    chartid,
                    label,
                    type,
                    chartData,
                    null,
                    true
            )

    },
    refreshChart: function(refresh_rate,chartid,title,type,path){
        // debugger;
        if (title == 'Top Five Selling Items'){
             frappe.spdashboard.quantity();
        }
        else if (title == 'Top Five Stock Items'){
             frappe.spdashboard.quantity1();
        }
        else if (title == 'Project Wise Monthly Income And Expense'){
             frappe.spdashboard.selector_project();
        }
        const timer = new easytimer.Timer();
        timer.start({target:{seconds: refresh_rate}});
        timer.addEventListener('targetAchieved', function (e) {
//            console.log(timer.getTimeValues().toString())

            if(type == 'Custom'){
                chartData = frappe.spdashboard.getChartData(path,null,chartid)
                $.each(chartData.widget_items,function(k,v){
                    if(v.widget_type != 1){
                        if(v.widget_type != 'Column Break' && v.widget_type != 'Section Break'){
                            childChartData = frappe.spdashboard.getChartData(v.dotted_path,chartData.last_filters);
                            frappe.spdashboard.updateChart(v.name,v.title,v.widget_type,childChartData);
                        }
                    }
                })
            }else{
                chartData = frappe.spdashboard.getChartData(path,null,chartid)
                frappe.spdashboard.updateChart(chartid,title,type,chartData);
            }

            cur_datetime = new Date().toLocaleString()
            sec = ''
            if(refresh_rate == 1)
                sec = 'second'
            else
                sec = 'seconds'
            $('#lu_'+chartid).html('Last update: '+refresh_rate+' '+sec+' ago')

             frappe.spdashboard.refreshChart(refresh_rate,chartid,title,type,path);

            if (user_lang == 'ar') {
                 $('div[data-link="snapprocesslist"]').find('label').text('المفاجئة والبريد')
            $('div[data-link="pos"]').find('label').text('نقطة البيع')
            $('div[data-link="modules/etl"]').find('label').text('استخراج تحويل الحمل')
            $('div[data-link="List/Sales Invoice"]').find('label').text('فاتورة المبيعات')
            $('div[data-link="List/Purchase Invoice"]').find('label').text('فاتورة الشراء')
            $('div[data-link="Tree/Chart Of Account"]').find('label').text('الرسم البياني للحساب')
            $('div[data-link="List/Journal Entry"]').find('label').text('إفتتاحية المجلة')
            $('div[data-link="List/Payment Entry"]').find('label').text('دخول الدفع')
            $('div[data-link="List/Stock Entry"]').find('label').text('دخول الأسهم')
            $('div[data-link="explore"]').find('label').text('استكشاف - بحث')
            $('div[data-link="Snap & Post"]').text('الالتقاط و المشاركة')
            $('div[data-link="Company Info"]').text('بيانات الشركة')
            $('div[data-link="Newsletter"]').text('النشرة الإخبارية')
            $('small[data-link="Draft"]').text('مشروع')
            $('small[data-link="Pending"]').text('قيد الانتظار')
            $('small[data-link="In Process"]').text('تحت المعالجة')
            $('small[data-link="Re-Work"]').text('إعادة العمل')
            $('small[data-link="Completed"]').text('منجز')
            $('#lu_Chart000020').text('آخر تحديث: منذ 1 ثانية')
            $('#lu_Chart000021').text('آخر تحديث: منذ 1 ثانية')
            $('#lu_Chart000023').text('آخر تحديث: منذ 1 ثانية')
            $('#lu_Chart000009').text('آخر تحديث: منذ 5 ثوانٍ')
            $('#lu_Chart000001').text('آخر تحديث: منذ 3 ثوانٍ')
            $('#lu_Chart000003').text('آخر تحديث: منذ 1 ثوانٍ')
            $('#lu_Chart000002').text('آخر تحديث: منذ 1 ثوانٍ')
            $('#lu_Chart000024').text('آخر تحديث: منذ 1 ثوانٍ')
            $('#lu_Chart000005').text('آخر تحديث: منذ 4 ثوانٍ')
            $('#lu_Chart000004').text('آخر تحديث: منذ 4 ثوانٍ')
            $('#lu_Chart000006').text('آخر تحديث: منذ 4 ثوانٍ')
            $('#lu_Chart000007').text('آخر تحديث: منذ 4 ثوانٍ')

            $('b[data-link="TRN"]').text('رقم الرخصة التجارية#')
            $('b[data-link="Auditor_Name"]').text('اسم المراجع:')
            $('b[data-link="Email"]').text('البريد الإلكتروني:')
            $('b[data-link="Contract_Start_Date"]').text('تاريخ بدء العقد:')
            $('b[data-link="Customer_Type"]').text('نوع العميل:')
            $('b[data-link="Description"]').text('وصف:')
            $('a[data-link="see_all"]').text('اظهار الكل')
            $('span[data-link="Sales Summary"]').text('ملخص المبيعات')
            $('p[data-link="Total Sales"]').text('إجمالي المبيعات')
            $('p[data-link="Values-"]').text('القيم بالآلاف')
            $('p[data-link="Values-Total Sales"]').text('القيم بالآلاف')
            $('small[data-link="Un-Paid"]').text('غير مأجور')
            $('small[data-link="Paid"]').text('دفع')
            $('div[data-link="Payment Status"]').text('حالة السداد')
            $('span[data-link="Monthly Income And Expense"]').text('الدخل الشهري والمصروفات')
            $('div[data-link="Monthly Income And Expense"]').text('القيم بالآلاف')
            $('span[data-link="Monthly Purchase"]').text('المشتريات الشهرية')
            $('span[data-link="Monthly Sales"]').text('المبيعات الشهرية')
            $('div[data-link="Monthly Purchase"]').text('المشتريات الشهرية')
            $('div[data-link="Monthly Sales"]').text('القيم بالآلاف')
            $('div[data-link="Login Activity"]').text('نشاط تسجيل الدخول')
            $('span[data-link="Total Payable"]').text('إجمالي مستحق الدفع')
            $('span[data-link="Total Receivable"]').text('مجموع المستحقات')
            $('span[data-link="Top Five Stock Items"]').text('أعلى خمسة بنود المخزون')
            $('span[data-link="Top Five Selling Items"]').text('أعلى خمسة بنود البيع')
            $('label[data-link="Total Amount"]').text('المبلغ الإجمالي')
            $('.b2').html('كمية')
            $('.a2').html('كمية')
            $('.b1').html('كمية')
            $('.a1').html('كمية')
            }

        });

    }

})
//
// function locationChange(id,type) {
//     if (type == 1) {
//         window.location.href = id
//         // location.reload();
//     }
// }

