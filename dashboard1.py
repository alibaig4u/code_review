from __future__ import unicode_literals

import frappe
import json
import json, ast
from datetime import datetime
from frappe import throw, msgprint, _

@frappe.whitelist()
def getEnabledCharts():
    list = frappe.get_list("Dashboard Setup",fields="*",order_by="sequence",filters={'disabled':0,'is_child':0},ignore_permissions=True)
    chartlist = []
    for val in list:
        cur_list = frappe.get_doc('Dashboard Setup',val.name)
        for a_r in cur_list.assign_roles:
            if a_r.role in frappe.get_roles(frappe.session.user):
                chartlist.append(val)
                break

    for idx, val in enumerate(chartlist):
        cur_list = frappe.get_doc('Dashboard Setup', val.name)
        chartlist[idx]['widget_items'] = cur_list.widget_items
        chartlist[idx]['last_filters'] = cur_list.chart_filters
    # continue

    return chartlist

@frappe.whitelist()
def customChart1(filters=None,chartid=None):

    if (chartid is not None and chartid != '') and (filters is not None and filters != ''):
        l_f = frappe.get_list("Widget Filters", fields="*", filters={"chart_id": chartid, "user": frappe.session.user},ignore_permissions=True)
        if len(l_f) > 0:
            dbs= frappe.get_doc("Widget Filters",l_f[0].name)
            dbs.filters = filters
            dbs.save()
        else:
            dbs = frappe.get_doc("Dashboard Setup", chartid)
            cd = dbs.append('chart_filters', {})
            cd.user = frappe.session.user
            cd.chart_id = chartid
            cd.filters = filters
            dbs.save()


    chartData = {}

    l_f = frappe.get_list("Widget Filters", fields="*", filters={"chart_id": chartid, "user": frappe.session.user},ignore_permissions=True)
    if len(l_f) > 0:
        chartData.update({"last_filters": l_f[0].filters})
    else:
        chartData.update({"last_filters": ''})

    if filters:
        filters = json.loads(filters)
        return frappe.get_doc("Dashboard Setup",chartid)
    else:
        filters = []
        # filters = [
        #     {"QUATER1": ["JAN-18", "FEB-18", "MAR-18"]},
        #     {"QUATER2": ["APR-18", "MAY-18", "JUN-18"]}
        # ]

        chartData.update({"filters": filters})
    return chartData

@frappe.whitelist()
def pieChart1(filters=None,chartid=None):

    if (chartid is not None and chartid != '') and (filters is not None and filters != ''):
        l_f = frappe.get_list("Widget Filters", fields="*", filters={"chart_id": chartid, "user": frappe.session.user},ignore_permissions=True)
        if len(l_f) > 0:
            dbs= frappe.get_doc("Widget Filters",l_f[0].name)
            dbs.filters = filters
            dbs.save()
        else:
            dbs = frappe.get_doc("Dashboard Setup", chartid)
            cd = dbs.append('chart_filters', {})
            cd.user = frappe.session.user
            cd.chart_id = chartid
            cd.filters = filters
            dbs.save()


    chartData = {}
    values = []
    labels = ['A', 'B', 'C']
    data = {}

    if filters == 'APR-18':
        data = {'name': 'A', "value": 500}
        values.append(data)

        data = {'name': 'B', "value": 869}
        values.append(data)

        data = {'name': 'C', "value": 650}
        values.append(data)
    else:
        data = {'name': 'A', "value": 1212}
        values.append(data)

        data = {'name': 'B', "value": 800}
        values.append(data)

        data = {'name': 'C', "value": 500}
        values.append(data)

    chartData.update({"labels": labels})
    chartData.update({"values": values})

    l_f = frappe.get_list("Widget Filters", fields="*", filters={"chart_id": chartid, "user": frappe.session.user},ignore_permissions=True)
    if len(l_f) > 0:
        chartData.update({"last_filters": l_f[0].filters})
    else:
        chartData.update({"last_filters": ''})

    filters = [
        {"QUATER1": ["JAN-18","FEB-18","MAR-18"]},
        {"QUATER2": ["APR-18","MAY-18","JUN-18"]}
    ]

    chartData.update({"filters": filters})

    return chartData

@frappe.whitelist()
def areaChart1(filters=None,chartid=None):

    if (chartid is not None and chartid != '') and (filters is not None and filters != ''):
        l_f = frappe.get_list("Widget Filters", fields="*", filters={"chart_id": chartid, "user": frappe.session.user},ignore_permissions=True)
        if len(l_f) > 0:
            dbs= frappe.get_doc("Widget Filters",l_f[0].name)
            dbs.filters = filters
            dbs.save()
        else:
            dbs = frappe.get_doc("Dashboard Setup", chartid)
            cd = dbs.append('chart_filters', {})
            cd.user = frappe.session.user
            cd.chart_id = chartid
            cd.filters = filters
            dbs.save()

    chartData = {}
    if filters == 'APR-18':
        labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G']
        values = [100, 932, 500, 600, 600, 1330, 1000]
    else:
        labels = ['A', 'B', 'C', 'D', 'E']
        values = [564, 860, 200, 300, 289]
    chartData.update({"labels":labels})
    chartData.update({"values":values})

    l_f = frappe.get_list("Widget Filters", fields="*",filters={"chart_id":chartid,"user":frappe.session.user},ignore_permissions=True)
    if len(l_f) > 0:
        chartData.update({"last_filters":l_f[0].filters})
    else:
        chartData.update({"last_filters":''})

    filters = [
        {"QUATER1": ["JAN-18", "FEB-18", "MAR-18"]},
        {"QUATER2": ["APR-18", "MAY-18", "JUN-18"]}
    ]

    chartData.update({"filters": filters})

    return chartData

@frappe.whitelist()
def barChart1(filters=None,chartid=None):

    if (chartid is not None and chartid != '') and (filters is not None and filters != ''):
        l_f = frappe.get_list("Widget Filters", fields="*", filters={"chart_id": chartid, "user": frappe.session.user},ignore_permissions=True)
        if len(l_f) > 0:
            dbs= frappe.get_doc("Widget Filters",l_f[0].name)
            dbs.filters = filters
            dbs.save()
        else:
            dbs = frappe.get_doc("Dashboard Setup", chartid)
            cd = dbs.append('chart_filters', {})
            cd.user = frappe.session.user
            cd.chart_id = chartid
            cd.filters = filters
            dbs.save()

    chartData={}
    # chartData=[]
    values=[]
    dataSeries = []
    # data = []
    labels = ['Matcha Latte', 'Milk Tea', 'Cheese Cocoa','Walnut Brownie']
    values.append(['label', 'Matcha Latte', 'Milk Tea', 'Cheese Cocoa','Walnut Brownie'])

    # equals to labels
    dataSeries.append({"type": "bar"})
    dataSeries.append({"type": "bar"})
    dataSeries.append({"type": "bar"})
    dataSeries.append({"type": "bar"})

    if filters == 'APR-18':
        data = ['2018', 138, 85.2, 182.5, 169]
        values.append(data)
        # data = ['2019', 138, 85.2, 182.5, 169]
        # values.append(data)
        # data = ['201', 138, 85.2, 182.5, 169]
        # values.append(data)
    else:
        data = ['2015', 100, 160, 1500, 30]
        values.append(data)

        data = ['2016', 200, 73.4, 2000, 145.8]
        values.append(data)

        data = ['2017', 86.4, 65.2, 82.5,134]
        values.append(data)

    chartData.update({"labels": labels})
    chartData.update({"values": values})
    chartData.update({"series": dataSeries})

    l_f = frappe.get_list("Widget Filters", fields="*", filters={"chart_id": chartid, "user": frappe.session.user},ignore_permissions=True)
    if len(l_f) > 0:
        chartData.update({"last_filters": l_f[0].filters})
    else:
        chartData.update({"last_filters": ''})

    filters = [
        {"QUATER1": ["JAN-18", "FEB-18", "MAR-18"]},
        {"QUATER2": ["APR-18", "MAY-18", "JUN-18"]}
    ]

    chartData.update({"filters": filters})

    return chartData

@frappe.whitelist()
def range(filters=None,chartid=None):

    if (chartid is not None and chartid != '') and (filters is not None and filters != ''):
        l_f = frappe.get_list("Widget Filters", fields="*", filters={"chart_id": chartid, "user": frappe.session.user},ignore_permissions=True)
        if len(l_f) > 0:
            dbs= frappe.get_doc("Widget Filters",l_f[0].name)
            dbs.filters = filters
            dbs.save()
        else:
            dbs = frappe.get_doc("Dashboard Setup", chartid)
            cd = dbs.append('chart_filters', {})
            cd.user = frappe.session.user
            cd.chart_id = chartid
            cd.filters = filters
            dbs.save()

    chartData = {}
    if filters == 'APR-18':
        values = 100
    else:
        values = 200
    chartData.update({"values":values})

    l_f = frappe.get_list("Widget Filters", fields="*", filters={"chart_id": chartid, "user": frappe.session.user},ignore_permissions=True)
    if len(l_f) > 0:
        chartData.update({"last_filters": l_f[0].filters})
    else:
        chartData.update({"last_filters": ''})

    filters = [
        {"QUATER1": ["JAN-18", "FEB-18", "MAR-18"]},
        {"QUATER2": ["APR-18", "MAY-18", "JUN-18"]}
    ]

    chartData.update({"filters": filters})

    return chartData


@frappe.whitelist()
def user_info():
    lang=''
    userinfo = frappe.get_list("User", filters=[["name", "=", frappe.session.user]], fields=['*'],ignore_permissions=True)
    if len(userinfo) > 0:
        for user_all in userinfo:
            if user_all.language == 'ar':
                lang =user_all.language
                return lang
        return lang

@frappe.whitelist()
def color_change_newsletter(id):
    user = frappe.session.user
    check_entry = frappe.get_list("Widget View Newsletter", filters={'parent': id, 'user': user},
                                  fields=['*'],ignore_permissions=True)
    if len(check_entry) > 0:
        return True
    else:
        return False

@frappe.whitelist()
def list_of_project(project_id=None):
    if project_id:
        sql = """SELECT * FROM tabProject WHERE `status`='Open' and name!='{0}' ORDER BY creation DESC""".format(project_id)
        filter_result = frappe.db.sql(sql, as_dict=True)
        return filter_result
    else:
        sql = """SELECT * FROM tabProject WHERE `status`='Open' ORDER BY creation DESC """
        filter_result = frappe.db.sql(sql, as_dict=True)
        return filter_result

