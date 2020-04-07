// Copyright (c) 2018, Maven Solutions and contributors
// For license information, please see license.txt

frappe.ui.form.on('VAT Filling Process', {
	refresh: function(frm) {

	    if (cur_frm.doc.workflow_state != 'Return Filing Completed' && cur_frm.doc.workflow_state != 'Self Filed by Client') {
	        if(cur_frm.doc.tat_start_date != null) {
                getTAT(frm);
            }
        }
        else {
	        cur_frm.doc.tat_start_date = '';
            cur_frm.doc.tat = '0:00'
        }

        if (frm.doc.__islocal == 1) {
		    frm.fields_dict['new_activity'].$wrapper.parents('.form-section').hide()
		}else{
		    frm.fields_dict['new_activity'].$wrapper.parents('.form-section').show()
		}

        if (frm.doc.__islocal != 1) {
            vat.activity_template.show_activities(frm);
        } // end if

        if (frm.doc.workflow_state == 'Assigned to DEO Outdoor') {
            frm.set_df_property("disposition_assign_deo", "read_only", frm.doc.__islocal ? 0 : 0);
        }
        else {
            frm.set_df_property("disposition_assign_deo", "read_only", frm.doc.__islocal ? 0 : 1);
        }

        cur_frm.page.set_inner_btn_group_as_primary(__("Other Options"));
        //frm.set_df_property("refund_claim_amount", "read_only", 1);
        if (user === "Administrator" || roles.indexOf("BackOffice Master") !== -1 ) {
            if (frm.doc.workflow_state == 'Return Filing Completed') {
                frm.add_custom_button(__("Open this record"), function () {
                    msgprint('Please wait while the record is opening.....!', 'Message')
                    $('.btn-modal-close').attr('disabled', true)
                    frappe.call({
                        method: 'vat.sales.doctype.vat_filling_process.vat_filling_process.openRecord',
                        args: {
                            "vfpData": frm.doc.name
                        },
                        callback: function (r) {
                            if (!r.exc) {
                                $('.msgprint').html('Record has been opened for editing!')
                                $('.btn-modal-close').removeAttr('disabled')
                                location.reload()
                            }
                        }
                    });
                }, __("Other Options"));
                /* Cancel Account */
                frm.add_custom_button(__("Start Refund Claim"), function () {
                    updateFields(frm)
                    validated = false
                }, __("Other Options"));
            }
            frm.add_custom_button(__("Cancel Account"), function () {
                msgprint('Please wait while system Cancel Account...!', 'Message');
                $('.btn-modal-close').attr('disabled', true);
                frappe.call({
                    method: 'vat.sales.doctype.vat_filling_process.vat_filling_process.cancelAccount',
                    args: {
                        "vfpData": frm.doc.name
                    },
                    callback: function (r) {
                        debugger;
                        if (!r.exc) {
                            location.reload();
                            $('.msgprint').html('Account has been cancelled!');
                            $('.btn-modal-close').removeAttr('disabled');
                            // code snippet
                        }
                    }
                });
            }, __("Other Options"));
        }

        if (user === "Administrator" || roles.indexOf("Relationship Manager") !== -1 ) {
            if (frm.doc.workflow_state == 'Return Filing Completed') {

                /* Customer Feedback */
                frm.add_custom_button(__("Customer Feedback"), function () {
                    debugger;
                    customerFeedback(frm)
                    //frappe.call({
                    //    method: 'vat.sales.doctype.vat_filling_process.vat_filling_process.customerFeedback',
                    //    args: {
                    //        "vfpData": frm.doc.name,
                    //        "status": 0
                    //    },
                    //    callback: function (r) {
                    //        if (!r.exc) {
                    //            customerFeedback(frm)
                    //        }
                    //    }
                    //});
                }, __("Other Options"));
            }
        }

        if (user === "Administrator" || roles.indexOf("Data Manager") !== -1 ) {

            frm.add_custom_button(__("Update User Permissions"), function () {
                msgprint('Please wait while system updates User Permissions.....!', 'Message')
                $('.btn-modal-close').attr('disabled', true)
                frappe.call({
                    method: 'vat.sales.doctype.vat_filling_process.vat_filling_process.providePermissions',
                    callback: function (r) {
                        if (!r.exc) {
                            $('.msgprint').html('User Permissions has been set!')
                            $('.btn-modal-close').removeAttr('disabled')

                        }
                    }
                });
            }, __("Other Options"));

           /* Generate Permission */
            frm.add_custom_button(__("Generate Permission"), function () {
                msgprint('Please wait while updates User Permissions.....!', 'Message')
                $('.btn-modal-close').attr('disabled', true)
                frappe.call({
                    method: 'vat.sales.doctype.vat_filling_process.vat_filling_process.generatePermissions',
                    args: {
                        "vfpData": frm.doc.name
                    },
                    callback: function (r) {
                        if (!r.exc) {
                            $('.msgprint').html('User Permissions has been set!')
                            $('.btn-modal-close').removeAttr('disabled')
                        }
                    }
                });
            }, __("Other Options"));
        }

        if (user === "Administrator" || roles.indexOf("Data Manager")!== -1 || roles.indexOf("BO Auditor") !== -1) {
            cur_frm.page.set_inner_btn_group_as_primary(__("Send Emails"));

            //Reminder Email
            frm.add_custom_button(__("Reminder Email"), function () {
                sendReminderEmail(frm);
            }, __("Send Emails"));

            //Non-Responsive Client Email
            frm.add_custom_button(__("Non-Responsive Client Email"), function () {
                send_NonResponsiveEmail(frm);
            }, __("Send Emails"));
        }

        parentTree(frm);

        //New Activity
        frm.add_custom_button(__("New Activity"), function () {
            vat.activity_template.create_event(frm);
        });
	}
});

function customerFeedback(frm) {
    var d = new frappe.ui.Dialog({
        'title': 'Customer Feedback',
        'fields': [
            {
                'label': '',
                'fieldname': 'dialog_section_break_101',
                'fieldtype': 'Section Break',
            },
            {
                'label': 'Called By',
                'fieldname': 'dialog_called_by',
                'fieldtype': 'Select',
                'options': [, "CSR", "Auditor", "Sr. Auditor", "Client"],
                'reqd': '1'
            },
            {
                'label': 'Last Call Date',
                'fieldname': 'dialog_last_call_date',
                'fieldtype': 'Datetime',
                'reqd': '1'
            },
            {
                'label': '',
                'fieldname': 'dialog_column_break_103',
                'fieldtype': 'Column Break',
            },
            {
                'label': 'Client Feedback',
                'fieldname': 'dialog_client_feedback',
                'fieldtype': 'Select',
                'options': [, "Satisfied", "Not Satisfied", "Client changed service", "Complaint - KAM", "Complaint - Auditor", "Complaint - CSR", "Complaint - CTM", "Complaint - Overall", "Non-Responsive Clients"],
                'reqd': '1'
            },
            {
                'label': 'Call File',
                'fieldname': 'dialog_attach',
                'fieldtype': 'Attach',
                'reqd': '1'
            },
            {
                'label': '',
                'fieldname': 'dialog_section_break_101',
                'fieldtype': 'Section Break',
            },
            {
                'label': 'Remarks',
                'fieldname': 'dialog_remarks',
                'fieldtype': 'Long Text',
                'reqd': '1'
            }
        ],
        primary_action: function (data) {
            d.hide();
            show_alert(d.get_values());
            frm.set_value('calledby', data.dialog_called_by);
            frm.set_value('client_feedback', data.dialog_client_feedback);
            frm.set_value('last_call_date', data.dialog_last_call_date);
            frm.set_value('remarks', data.dialog_remarks);
            frm.set_value('call_status', 'Call Completed');

            var currDate = data.dialog_last_call_date.split(' ');

            var child = cur_frm.add_child('office');
                child.document_date = currDate[0];

                frappe.call({
                    method: 'vat.sales.doctype.vat_filling_process.vat_filling_process.clientFeedbackPostFiling',
                    args: {
                        "vfpData": frm.doc.name,
                        "documentName": 'Client Feedback Post Filing'
                    },
                    async: false,
                    callback: function (r) {
                        if (!r.exc) {
                            child.document_type = r.message[0][0];
                        }
                    }
                });
                child.document_name = 'Client Feedback Post Filing';
                child.attachment = data.dialog_attach.split(',')[0];
                cur_frm.refresh_field('office');

            cur_frm.save();
            msgprint('Customer Feedback has been set!', 'Message')
            $('.btn-modal-close').removeAttr('disabled')
            $('.msgprint').parents('.modal').on("hidden.bs.modal", function () {
                // put your default event here
                frappe.call({
                    method: 'vat.sales.doctype.vat_filling_process.vat_filling_process.customerFeedback',
                    args: {
                        "vfpData": frm.doc.name,
                        "status": 1
                    },
                    callback: function (r) {
                        if (!r.exc) {
                            location.reload()
                        }
                    }
                });
            });
        }
    });

    d.show();
}


function parentTree(frm) {
    var li = "<style type=\"text/css\">\n" +
    "\n" +
    ".clt {\n" +
    "    border: solid 1px;\n" +
    "    padding-top: 12px;\n" +
    "}\n" +
    "\n" +
    ".clt, .clt ul, .clt li {\n" +
    "     position: relative;\n" +
    "     font-size: 12px;\n" +
    "}\n" +
    "\n" +
    ".clt ul {\n" +
    "    list-style: none;\n" +
    "    padding-left: 32px;\n" +
    "}\n" +
    "\n" +
    ".clt li::before, .clt li::after {\n" +
    "    content: \"\";\n" +
    "    position: absolute;\n" +
    "    left: -12px;\n" +
    "}\n" +
    "\n" +
    ".clt li::before {\n" +
    "    border-top: 1px solid #000;\n" +
    "    top: 9px;\n" +
    "    width: 8px;\n" +
    "    height: 0;\n" +
    "}\n" +
    "\n" +
    ".clt li::after {\n" +
    "    border-left: 1px solid #000;\n" +
    "    height: 100%;\n" +
    "    width: 0px;\n" +
    "    top: 2px;\n" +
    "}\n" +
    "\n" +
    ".clt ul > li:last-child::after {\n" +
    "    height: 8px;\n" +
    "}\n" +
    "</style>";
    var doc = frm.doc.business_id
    $("div[data-fieldname='parent_tree']").html("");
    frappe.call({
        method: 'vat.sales.doctype.vat_filling_process.vat_filling_process.getChildOrg',
        args: {
            "parentOrg": doc
        },
        async: false,
        callback: function (r) {
            debugger;
            if (!r.exc) {
                if(r.message){
                    li += "<label class='control-label' style='padding-right: 0px;'>VPS Tree</label>" + "<div class='clt'><ul>"
                    if(frm.doc.parentorg == null) {
                        // li += "<li><b><a href='http://localhost:8000/desk#Form/Organization/" + doc + "'>" + r.message[0].porg + "</a> " + "(" + "<a href='http://localhost:8000/desk#Form/VAT%20Processing%20System/"+r.message[0].pvps+"'>" + r.message[0].pvps + "</a>" + ")" + "</b><ul>"
                        li += "<li><b><a href='"+window.location.protocol+"//"+window.location.hostname+"/desk#Form/Organization/" + doc + "'>" + r.message[0].porg + "</a>" + "(" + "<a href='"+window.location.protocol+"//"+window.location.hostname+"/VAT%20Processing%20System/"+ r.message[0].pvps +"'>" + r.message[0].pvps + "</a>" + ")" + "</b><ul>"
                    }else {
                        // li += "<li><a href='http://localhost:8000/desk#Form/Organization/" + doc + "'>" + r.message[0].porg + "</a> " + "(" + "<a href='http://localhost:8000/desk#Form/VAT%20Processing%20System/"+r.message[0].pvps+"'>" + r.message[0].pvps + "</a>" + ")" + "<ul>"
                        li += "<li><a href='"+window.location.protocol+"//"+window.location.hostname+"/desk#Form/Organization/" + doc + "'>" + r.message[0].porg + "</a>" + "(" + "<a href='"+window.location.protocol+"//"+window.location.hostname+"/VAT%20Processing%20System/"+ r.message[0].pvps +"'>" + r.message[0].pvps + "</a>" + ")" + "<ul>"
                    }
                    $.each(r.message, function (k, v) {
                        debugger;
                        var org = v.org.split("-")
                        if(frm.doc.business_id == org[0]) {
                            // li += "<li><b><a href='http://localhost:8000/desk#Form/Organization/" + org[0] + "'>" + v.org + "</a> " + "(" + "<a href='http://localhost:8000/desk#Form/VAT%20Processing%20System/"+ v.vps +"'>" + v.vps + "</a>" + ")" + "</b></li>"
                            li += "<li><b><a href='"+window.location.protocol+"//"+window.location.hostname+"/desk#Form/Organization/" + org[0] + "'>" + v.org + "</a> " + "(" + "<a href='"+window.location.protocol+"//"+window.location.hostname+"/VAT%20Processing%20System/"+ v.vps +"'>" + v.vps + "</a>" + ")" + "</b></li>"
                        }else {
                            // li += "<li><a href='http://localhost:8000/desk#Form/Organization/" + org[0] + "'>" + v.org + "</a> " + "(" + "<a href='http://localhost:8000/desk#Form/VAT%20Processing%20System/"+ v.vps +"'>" + v.vps + "</a>" + ")" + "</li>"
                            li += "<li><a href='"+window.location.protocol+"//"+window.location.hostname+"/desk#Form/Organization/" + org[0] + "'>" + v.org + "</a> " + "(" + "<a href='"+window.location.protocol+"//"+window.location.hostname+"/VAT%20Processing%20System/"+ v.vps +"'>" + v.vps + "</a>" + ")" + "</li>"
                        }
                    });
                }
            }
        }
    });
    li += "</ul></li></ul></div>";
    $(li).appendTo("div[data-fieldname='parent_tree']")
}

function updateFields(frm) {
    var d = new frappe.ui.Dialog({
        'title': 'Validate',
        'fields': [
            {
                'label': 'Refund Claim Amount',
                'fieldname': 'dialog_refund_claim_amount',
                'fieldtype': 'Float',
                'reqd': '1'
            }
        ],
        primary_action: function (data) {
            d.hide();
            show_alert(d.get_values());
            frm.set_value('refund_claim_amount', data.dialog_refund_claim_amount)

            if(data.dialog_refund_claim_amount > 0)
            {
                frappe.call({
                    method: 'vat.sales.doctype.vat_filling_process.vat_filling_process.getRefundClaim',
                    args: {
                       "doc": frm.doc.name,
                        "refund_claim_amount":data.dialog_refund_claim_amount
                     },
                    callback:function(r){
                        if (!r.exc) {
                            location.reload()
                        }
                    }
                });
            }
        }
    });
    // d.set_value('dialog_refund_claim_amount', frm.doc.refund_claim_amount)
    d.show();
}

frappe.ui.form.on("VAT Filling Process", "onload", function(frm) {
    frm.set_query("processorid", function() {
        return{
            query: 'vat.sales.doctype.vat_filling_process.vat_filling_process.getProcessor'
        }
    });
});

frappe.ui.form.on("VAT Filling Process", "onload", function(frm) {

    frm.set_query("csrid", function() {
        return{
            query: 'vat.sales.doctype.vat_filling_process.vat_filling_process.getCSR'
        }
    });
});

frappe.ui.form.on("VAT Filling Process", "onload", function(frm) {

    frm.set_query("rmid", function() {
        return{
            query: 'vat.sales.doctype.vat_filling_process.vat_filling_process.getRM'
        }
    });
});

// frappe.ui.form.on("VAT Filling Process", "disposition_assign_deo", function (frm) {
//     if (cur_frm.doc.disposition_assign_deo == 'Task completed') {
//         getEndDate(frm);
//     }
//     else {
//         cur_frm.doc.tat_end_date = '';
//         cur_frm.refresh_field('tat_end_date', '');
//     }
// });

/*
function create_event(frm = null, data = null) {

    var msg = 'Creating Event';
    var uptdmsg = 'Event Has Been Created';
    var method = 'createEvent';

    if (data != null) {
        msg = 'Updating Event';
        uptdmsg = 'Event Has Been Updated';
        method = 'updateEvent';
    } // end if
    var d = new frappe.ui.Dialog({
        'title': 'Create New Activity',
        'fields': [
            {
                'label': 'Subject',
                'fieldname': 'subject_dialog',
                'fieldtype': 'Data',
                'reqd': 1
            },
            {
                'label': 'Start Date & Time',
                'fieldname': 'start_datetime_dialog',
                'fieldtype': 'Datetime',
                'reqd': 1
            },
            {
                'label': 'Opening Disposition',
                'fieldname': 'opening_disposition_dialog',
                'fieldtype': 'Select',
                'options': '\nDevice Delivery and VPS Training\nSales Discrepancy Closure\nManual Filing\nManual Filing and VPS Training\nPayment Collection\nPayment Collection and Manual Filing\nPayment Collection and VPS Training\nRetention Visit\nVPS Training for New Staff\nVPS Training\nContract Signing\nContract Renewal\nFAS Routine Visit\nFAS Data Verification\nFAS Financial Presentation\nFTA Related Queries Session\nSales Closing',
                'reqd': 1
            },
            {
                'label': 'Status',
                'fieldname': 'status_dialog',
                'fieldtype': 'Select',
                'options': 'Meeting Pending\nMeeting Concluded\nCalled and Closed\nRequest Rejected\nMeeting Scheduled\nMeeting Re-scheduled',
                'reqd': 1
            },
            {
                'label': 'Payment Status',
                'fieldname': 'payment_status_dialog',
                'fieldtype': 'Select',
                'options': 'UnPaid\nPaid',
                'reqd': 1
            },
            {
                'label': 'Reason',
                'fieldname': 'reason_dialog',
                'fieldtype': 'Text',
                'depends_on': 'eval:doc.status_dialog!="Meeting Pending"'
            },
            {
                'label': '',
                'fieldname': 'colbr1_act_dialog',
                'fieldtype': 'Column Break',
            },
            {
                'label': 'Assigned To',
                'fieldname': 'assigned_to_dialog',
                'fieldtype': 'Link',
                'options': 'User',
                'reqd': 1
            },
            {
                'label': 'End Date & Time',
                'fieldname': 'end_datetime_dialog',
                'fieldtype': 'Datetime',
                'reqd': 1
            },
            {
                'label': 'Closing Disposition',
                'fieldname': 'closing_disposition_dialog',
                'fieldtype': 'Select',
                'options': '\nDevice Delivery and VPS Training\nSales Discrepancy Closure\nManual Filing\nManual Filing and VPS Training\nPayment Collection\nPayment Collection and Manual Filing\nPayment Collection and VPS Training\nRetention Visit\nVPS Training for New Staff\nVPS Training\nContract Signing\nContract Renewal\nVPS Training given on Call\nFAS Routine Visit\nFAS Data Verification\nFAS Financial Presentation\nFTA Related Queries Session\nSales Closing\nDuplicate/Inappropriate Meeting Created',
                'depends_on': 'eval:!in_list(["Meeting Pending", "Meeting Scheduled", "Meeting Re-scheduled"], doc.status_dialog)'
            },
            {
                'label': 'Activity Type',
                'fieldname': 'activity_type_dialog',
                'fieldtype': 'Select',
                'options': '\nCall\nMeeting',
                'reqd': 1
            },
            {
                'label': 'Notify Before',
                'fieldname': 'notify_before_dialog',
                'fieldtype': 'Select',
                'options': '\n01 Minute\n02 Minutes\n03 Minutes\n04 Minutes\n05 Minutes\n06 Minutes\n07 Minutes\n08 Minutes\n09 Minutes\n10 Minutes\n11 Minutes\n12 Minutes\n13 Minutes\n14 Minutes\n15 Minutes\n16 Minutes\n17 Minutes\n18 Minutes\n19 Minutes\n20 Minutes\n21 Minutes\n22 Minutes\n23 Minutes\n24 Minutes\n25 Minutes\n26 Minutes\n27 Minutes\n28 Minutes\n29 Minutes\n30 Minutes\n31 Minutes\n32 Minutes\n33 Minutes\n34 Minutes\n35 Minutes\n36 Minutes\n37 Minutes\n38 Minutes\n39 Minutes\n40 Minutes\n41 Minutes\n42 Minutes\n43 Minutes\n44 Minutes\n45 Minutes\n46 Minutes\n47 Minutes\n48 Minutes\n49 Minutes\n50 Minutes\n51 Minutes\n52 Minutes\n53 Minutes\n54 Minutes\n55 Minutes\n56 Minutes\n57 Minutes\n58 Minutes\n59 Minutes',
                'reqd': 1
            }
        ],
        primary_action: function (result) {
            msgprint(msg, 'Message');
            var args = {
                data: result,
                docname: frm.doc.name,
                doctype: frm.doc.doctype,
                org: frm.doc.business_id
            }; // end args // create event

            var startDateTime = new Date(result.start_datetime_dialog)
            var startDate = new Date(result.start_datetime_dialog.slice(0, 10)).setHours(0, 0, 0, 0)
            var endDateTime = new Date(result.end_datetime_dialog)
            var endDate = new Date(result.end_datetime_dialog.slice(0, 10)).setHours(0, 0, 0, 0)
            var now = new Date().setHours(0, 0, 0, 0)
            if (startDate < now) {
                $('.msgprint').html('');
                frappe.throw("Start Date cannot be less than today")
            } else if (endDateTime <= startDateTime) {
                $('.msgprint').html('');
                frappe.throw("End Date cannot be equal or less than start date")
            }
            if (data != null) {
                if (result.reason_dialog == null && result.status_dialog != 'Meeting Pending') {
                    $('.msgprint').html('');
                    frappe.throw("Please enter reason to update")
                } else {
                    if (result.reason_dialog == null)
                        result.reason_dialog = '';
                }
                if (result.status_dialog != 'Meeting Pending' && result.status_dialog != 'Meeting Scheduled' && result.status_dialog != 'Meeting Re-scheduled') {
                    if (result.closing_disposition_dialog == null) {
                        $('.msgprint').html('');
                        frappe.throw("Please Select Closing Disposition..!")
                    }
                }
                args = {
                    data: result,
                    org: frm.doc.business_id,
                    event: data.name
                };
            } // end if // edit event
            frappe.call({
                method: 'frappe.desk.doctype.event.event.' + method,
                args: args,
                callback: function (r) {
                    if (r.message) {
                        frappe.update_msgprint(uptdmsg);
                        d.hide();
                        vat.activity_template.show_activities(cur_frm)
                    } // end if
                } // end callback
            }); // end frappe call
        } // end primary action
    }); // end dialog

    d.show();
    if (data != null) {
        $('input[data-fieldname=subject_dialog]').attr('disabled', true);
        $('select[data-fieldname=opening_disposition_dialog]').attr('disabled', true);
        d.set_value("subject_dialog", data.subject);
        d.set_value("opening_disposition_dialog", data.opening_disposition);
        if (data.closing_disposition != null) {
            d.set_value("closing_disposition_dialog", data.closing_disposition);
        }
        d.set_value("payment_status_dialog", data.payment_status);
        d.set_value("status_dialog", data.status);
        d.set_value("assigned_to_dialog", data.user_id);
        d.set_value("activity_type_dialog", data.activity_type);
        d.set_value("notify_before_dialog", data.notify_before);
        d.set_value("reason_dialog", data.description);
        d.set_value("start_datetime_dialog", data.starts_on);
        d.set_value("end_datetime_dialog", data.ends_on);
        d.fields_dict['reason_dialog'].$wrapper.show();
    } else {
        // if (roles.indexOf("CTM User") == -1){
        //     d.set_value("assigned_to_dialog",'awais.hameed@skylines.ae');
        //     $('input[data-fieldname=assigned_to_dialog]').attr('disabled',true);
        // }
        d.fields_dict['reason_dialog'].$wrapper.hide();
        d.fields_dict['closing_disposition_dialog'].$wrapper.hide();
    } // end if
}

function edit_event(){
    $('.editEvent').on('click',function(){
        var event = $(this).parent().siblings().find("input[data-fieldname=eventid]").val();
        var message = get_event(null,event,null,null);
        vat.activity_template.create_event(cur_frm,message[0]);
    })  // end click event
}

function get_event(user=null,event=null,doctype=null,docname=null){
    var message;
    frappe.call({
        method: 'frappe.desk.doctype.event.event.getEvents',
        args: {
            "user": user,
            "event": event,
            "doctype": doctype,
            "docname": docname
        },
        async: false,
        callback: function (r) {
            if (r.message != null) {
                message = r.message;
            } // end if
        } // end callback
    }); // end frappe.call
    return message;
}

function show_activities(frm) {
    $('div[data-fieldname=activities]').html('');
    var message = get_event(null,null,frm.doc.doctype,frm.doc.name);
    if(message != null) {
        var html = '';
        $.each(message, function (k, v) {
            html += `<div style="background: #fff;margin-bottom: 30px;border: none;border-radius: 10px!important;box-shadow: 0 1px 18px rgba(0, 0, 0, 0.1);padding: 15px 15px 15px;">
            <p style="text-align: right; margin-top: -5px; font-weight: 700; color: red;" >` + v.status;
            if(v.status == 'Meeting Pending' || v.status == 'Meeting Scheduled' || v.status == 'Meeting Re-scheduled') {
                var parent_user = '';
                frappe.call({
                    method: 'frappe.desk.doctype.event.event.getParentUserInfo',
                    args: {
                        "userid": v.user_id
                    },
                    async: false,
                    callback: function (r) {
                        if (r.message != null) {
                            parent_user = r.message[0]["user_id"]
                        }
                    }
                });

                if(user == v.user_id || user == parent_user) {
                    html += `<i class="fa fa-pencil editEvent" style="color:#656565;margin-left:5px;cursor: pointer;"></i>`;
                }
            }
            html += `</p>
            <div class="row">
                <div class="col-md-6">
                    <input type="hidden" data-fieldname="eventid" value="` + v.name + `"/>
                    <label>Subject : ` + v.subject + `</label>
                    <p style="font-size: 12px" >Created By : ` + v.owner + `</p>
                    <p style="font-size: 12px" >Assigned To : ` + v.user_id + `</p>
                    <p style="font-size: 12px">Start Datetime : ` + v.starts_on + `</p>
                    <p style="font-size: 12px">End Datetime : ` + v.ends_on + `</p>`
                    if(v.document_attach!='' && v.document_attach!=null){
                        html += `<p style="font-size: 12px">Attachment : <a href="`+attachURL(v.document_attach)+`">`+v.document_attach+`</a></p>`
                    }
                html += `</div>`;
            if(v.description!='' && v.description!=null)
                html += `<div class="col-md-6"><label>Reason</label><p>`+v.description+`<p></div>`;
                html += `</div>
            </div>`;
        }); // end foreach
        $('div[data-fieldname=activities]').html(html)
        edit_event();
    } // end if
}

function attachURL(doc_attach){
    return location.origin+doc_attach
}
// event work end
*/

function getTAT(frm) {

   frappe.call({
       method: 'vat.sales.doctype.vat_filling_process.vat_filling_process.calculateTAT',
       args: {
           "startDate": frm.doc.tat_start_date
       },
       callback: function (r) {
           if (!r.exc) {
               var tat_time = r.message;
               if(tat_time != '') {
                    cur_frm.doc.tat = tat_time;

                    if (cur_frm.doc.workflow_state == 'QC 2' || cur_frm.doc.workflow_state == 'Submit Filing in FTA' || cur_frm.doc.workflow_state == 'Discrepant Client') {
                        if (tat_time <= "24:00") {
                            cur_frm.doc.flag = 'Green';
                            cur_frm.refresh_field('flag', 'Green');
                            cur_frm.refresh_field('tat', tat_time);
                            $("[data-fieldname='tat']").css("color", "green");
                            $("[data-fieldname='flag']").css("color", "green")
                        }
                        else {
                            cur_frm.doc.flag = 'Red';
                            cur_frm.refresh_field('flag', 'Red');
                            cur_frm.refresh_field('tat', tat_time);
                            $("[data-fieldname='tat']").css("color", "red");
                            $("[data-fieldname='flag']").css("color", "red")
                        }
                    }

                    else if (cur_frm.doc.workflow_state == 'Data Entry and Report Preparation' || cur_frm.doc.workflow_state == 'Assigned to DEO Outdoor' ||
                            cur_frm.doc.workflow_state == 'FTA Credentials Required' || cur_frm.doc.workflow_state == 'QC 1' ||
                            cur_frm.doc.workflow_state == 'Client Confirmation') {
                        if (tat_time <= "48:00") {
                            cur_frm.doc.flag = 'Green';
                            cur_frm.refresh_field('flag', 'Green');
                            cur_frm.refresh_field('tat', tat_time);
                            $("[data-fieldname='tat']").css("color", "green");
                            $("[data-fieldname='flag']").css("color", "green")
                        }
                        else {
                            cur_frm.doc.flag = 'Red';
                            cur_frm.refresh_field('flag', 'Red');
                            cur_frm.refresh_field('tat', tat_time);
                            $("[data-fieldname='tat']").css("color", "red");
                            $("[data-fieldname='flag']").css("color", "red")
                        }
                    }

                    else if (cur_frm.doc.workflow_state == 'Data Awaited from Client') {
                        if (tat_time <= "72:00") {
                            cur_frm.doc.flag = 'Green';
                            cur_frm.refresh_field('flag', 'Green');
                            cur_frm.refresh_field('tat', tat_time);
                            $("[data-fieldname='tat']").css("color", "green");
                            $("[data-fieldname='flag']").css("color", "green")
                        }
                        else {
                            cur_frm.doc.flag = 'Red';
                            cur_frm.refresh_field('flag', 'Red');
                            cur_frm.refresh_field('tat', tat_time);
                            $("[data-fieldname='tat']").css("color", "red");
                            $("[data-fieldname='flag']").css("color", "red")
                        }
                    }
                }
                else {
                    cur_frm.doc.tat = '0:00'
                }
           }
       }
   });
}

function getEndTAT(frm) {
   frappe.call({
       method: 'vat.sales.doctype.vat_filling_process.vat_filling_process.calculateTAT',
       args: {
           // "docname": frm.doc.name,
           "startDate": frm.doc.tat_start_date
       },
       callback: function (r) {
           if (!r.exc) {
               var tat_time = r.message;
               if (tat_time != '') {
                   cur_frm.doc.tat = tat_time;
                   cur_frm.refresh_field('tat', tat_time);
               }
               else {
                   cur_frm.doc.tat = '0:00'
               }
           }
       }
   });
}

function getEndDate(frm) {
    frappe.call({
        method: 'vat.sales.doctype.vat_filling_process.vat_filling_process.deo_outdoor_endDate',
        args: {
            "vfpid": frm.doc.name
        },
        callback: function (r) {
            if (!r.exc) {
                var endDate = r.message;
                cur_frm.doc.tat_end_date = endDate;
                cur_frm.refresh_field('tat_end_date', endDate);
            }
        }
    });
}

function sendReminderEmail(frm) {
    msgprint('Please wait while system send Reminder Mail...!', 'Message');
    $('.btn-modal-close').attr('disabled', true);
    frappe.call({
        method: 'vat.sales.doctype.vat_filling_process.vat_filling_process.reminder_mail',
        args: {
            "vfpid": frm.doc.name
        },
        callback: function (r) {
            if (!r.exc) {
                $('.msgprint').html('Reminder Mail has been sent!');
                $('.btn-modal-close').removeAttr('disabled');
                location.reload()
            }
        }
    });
}

function send_NonResponsiveEmail(frm) {
    msgprint('Please wait while system send Non Responsive Client Mail...!', 'Message');
    $('.btn-modal-close').attr('disabled', true);
    frappe.call({
        method: 'vat.sales.doctype.vat_filling_process.vat_filling_process.non_responsive_client_mail',
        args: {
            "vfpid": frm.doc.name
        },
        callback: function (r) {
            if (!r.exc) {
                $('.msgprint').html('Non Responsive Client Mail has been sent!');
                $('.btn-modal-close').removeAttr('disabled');
                location.reload()
            }
        }
    });
}

