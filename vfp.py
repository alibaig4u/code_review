# -*- coding: utf-8 -*-
# Copyright (c) 2018, Maven Solutions and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document
from datetime import timedelta, datetime
from frappe import permissions
from dateutil.relativedelta import relativedelta
from frappe.utils import now, get_formatted_email
from frappe import utils
from vat.setup.doctype.global_defaults.global_defaults import getDefaults

isnew = False
class VATFillingProcess(Document):
    stagechanged = 0

    tat_arr = {
        '24:00':
            [
                'QC 2',
                'Submit Filing in FTA',
                'Discrepant Client'
            ],
        '48:00':
            [
                 'Data Entry and Report Preparation',
                 'Assigned to DEO Outdoor',
                 'FTA Credentials Required',
                 'QC 1',
                 'Client Confirmation'
            ],
        '72:00':
            [
                'Data Awaited from Client'
            ]
    }

    def before_save(self):
        global isnew

        if self.is_new():
            isnew = True
        if not isnew:
            self.validateStageConditions(isnew)
        isnew = self.is_new()

        if self.vat_filling_date is not None and self.vat_filling_date != '':
            self.vat_filling_date = str(self.vat_filling_date)
            addsinglemonth = datetime.strptime(self.vat_filling_date, '%Y-%m-%d').date() + relativedelta(days=28)
            self.vat_filing_due_date = addsinglemonth

            if isnew:
                date_vat = datetime.strptime(self.vat_filling_date, '%Y-%m-%d').date()
                vfpname = self.name
                frappe.db.sql(
                    """update `tabVat Submission Schedule` set `vfp_name` = '%s' where parent = '%s' and vatsubmissiondate = '%s'""" % (
                    vfpname, self.name, date_vat))

                orgdoc = frappe.get_doc("Organization", self.business_id)
                frappe.db.sql(
                    """update `tabVat Submission Schedule` set `vfp_name` = '%s' where parent = '%s' and vatsubmissiondate = '%s'""" % (
                    vfpname, orgdoc.name, date_vat))

                ftadoc = frappe.get_list("FTA Registration Process", filters={"organizationid": self.business_id})
                if len(ftadoc) > 0:
                    frappe.db.sql(
                        """ update `tabVat Submission Schedule` set `vfp_name` = '%s' where parent = '%s' and vatsubmissiondate = '%s'""" % (
                        vfpname, ftadoc[0].name, date_vat))

                vatdoc = frappe.get_list("VAT Processing System", filters={"organizationid": self.business_id})
                if len(vatdoc) > 0:
                    frappe.db.sql(
                        """ update `tabVat Submission Schedule` set `vfp_name` = '%s' where parent = '%s' and vatsubmissiondate = '%s'""" % (
                        vfpname, vatdoc[0].name, date_vat))

        if self.currentstage != self.workflow_state:
            self.currentstage = self.workflow_state
            self.cur_wf_date = utils.today()
            self.stagechanged = 1

            startDate = datetime.strptime(now()[:19], '%Y-%m-%d %H:%M:%S')
            self.tat_start_date = startDate
            # self.createVFPlog()


    def before_cancel(self):
        if self.currentstage != self.workflow_state:
            self.currentstage = self.workflow_state
            self.cur_wf_date = utils.today()
            self.stagechanged = 1

    def validateStageConditions(self,isnew):
        self.checkAgent(isnew)
        self.checkTeamLeader(isnew)
        self.checkSalesManager(isnew)
        self.checkRM(isnew)
        self.check_SrAuditor(isnew)
        self.check_DEOIndoor(isnew)
        self.check_DEO_Outdoor(isnew)
        # self.checkCTM()
        # self.checkKAM()
        # self.checkProcessor()
        # self.checkCSR()


    def checkRM(self, isnew):
        if not isnew:
            currvfp = frappe.get_doc("VAT Filling Process", self.name)
            if self.rmid is not None and self.rmid != '':
                if self.rmid != currvfp.rmid:
                    if currvfp.rmid:
                        if self.canRevertPermission(currvfp.rmid) >0:
                            curr_rm_user = frappe.get_doc("Team Management", currvfp.rmid)
                            frappe.permissions.remove_user_permission("VAT Filling Process", self.name, curr_rm_user.user_id)

                    rm_user = frappe.get_doc("Team Management", self.rmid)
                    frappe.permissions.add_user_permission("VAT Filling Process", self.name, rm_user.user_id)
            else:
                if currvfp.rmid:
                    if self.canRevertPermission(currvfp.rmid) >0:
                        curr_rm_user = frappe.get_doc("Team Management", currvfp.rmid)
                        frappe.permissions.remove_user_permission("VAT Filling Process", self.name, curr_rm_user.user_id)
        else:
            # isnew = True
            if self.rmid is not None:
                ag_user = frappe.get_doc("Team Management", self.rmid)
                if ag_user.user_id is not None and ag_user.user_id != '':
                    frappe.permissions.add_user_permission("VAT Filling Process", self.name, ag_user.user_id)

    def canRevertPermission(self, id):
        flag = 1
        if id == self.agent:
            flag = 0
        if id == self.salesmanagerid:
            flag = 0
        if id == self.teamleaderid:
            flag = 0
        if id == self.ctm_link:
            flag = 0
        if id == self.rmid:
            flag = 0
        if id == self.processorid:
            flag = 0
        if id == self.csrid:
            flag = 0
        if id == self.sr_auditorid:
            flag = 0
        if id == self.deo_indoor:
            flag = 0
        if id == self.deo_outdoor:
            flag = 0
        return flag

    # Check Agent Permission
    def checkAgent(self, isnew):
        if not isnew:
            currVfp = frappe.get_doc("VAT Filling Process", self.name)
            if self.agent is not None and self.agent != '':
                if self.agent != currVfp.agent:
                    if currVfp.agent:
                        if self.canRevertPermission(currVfp.agent) > 0:
                            curr_agent = frappe.get_doc("Team Management", currVfp.agent)
                            if curr_agent.user_id is not None and curr_agent.user_id != '':
                                frappe.permissions.remove_user_permission("VAT Filling Process", self.name,
                                                                          curr_agent.user_id)

                    ag_user = frappe.get_doc("Team Management", self.agent)
                    if ag_user.user_id is not None and ag_user.user_id != '':
                        frappe.permissions.add_user_permission("VAT Filling Process", self.name, ag_user.user_id)
            else:
                if currVfp.agent:
                    if self.canRevertPermission(currVfp.agent) > 0:
                        curr_agent = frappe.get_doc("Team Management", currVfp.agent)
                        if curr_agent.user_id is not None and curr_agent.user_id != '':
                            frappe.permissions.remove_user_permission("VAT Filling Process", self.name, curr_agent.user_id)
        else:
            # isnew = True
            if self.agent is not None:
                ag_user = frappe.get_doc("Team Management", self.agent)
                if ag_user.user_id is not None and ag_user.user_id != '':
                    frappe.permissions.add_user_permission("VAT Filling Process", self.name, ag_user.user_id)

    # Check Team Leader Permission
    def checkTeamLeader(self, isnew):
        if not isnew:
            currVfp = frappe.get_doc("VAT Filling Process", self.name)
            if self.teamleaderid is not None and self.teamleaderid != '':
                if self.teamleaderid != currVfp.teamleaderid:
                    if currVfp.teamleaderid:
                        if self.canRevertPermission(currVfp.teamleaderid) > 0:
                            curr_teamLeader = frappe.get_doc("Team Management", currVfp.teamleaderid)
                            if curr_teamLeader.user_id is not None and curr_teamLeader.user_id != '':
                                frappe.permissions.remove_user_permission("VAT Filling Process", self.name,
                                                                          curr_teamLeader.user_id)

                    tl_user = frappe.get_doc("Team Management", self.teamleaderid)
                    if tl_user.user_id is not None and tl_user.user_id != '':
                        frappe.permissions.add_user_permission("VAT Filling Process", self.name, tl_user.user_id)
            else:
                if currVfp.teamleaderid:
                    if self.canRevertPermission(currVfp.teamleaderid) > 0:
                        curr_teamLeader = frappe.get_doc("Team Management", currVfp.teamleaderid)
                        if curr_teamLeader.user_id is not None and curr_teamLeader.user_id != '':
                            frappe.permissions.remove_user_permission("VAT Filling Process", self.name,
                                                                      curr_teamLeader.user_id)
        else:
            # isnew = True
            if self.teamleaderid is not None:
                ag_user = frappe.get_doc("Team Management", self.teamleaderid)
                if ag_user.user_id is not None and ag_user.user_id != '':
                    frappe.permissions.add_user_permission("VAT Filling Process", self.name, ag_user.user_id)


    # Check Sales Manager Permission
    def checkSalesManager(self, isnew):
        if not isnew:
            currVfp = frappe.get_doc("VAT Filling Process", self.name)
            if self.salesmanagerid is not None and self.salesmanagerid != '':
                if self.salesmanagerid != currVfp.salesmanagerid:
                    if currVfp.salesmanagerid:
                        if self.canRevertPermission(currVfp.salesmanagerid) > 0:
                            curr_salesManager = frappe.get_doc("Team Management", currVfp.salesmanagerid)
                            if curr_salesManager.user_id is not None and curr_salesManager.user_id != '':
                                frappe.permissions.remove_user_permission("VAT Filling Process", self.name, curr_salesManager.user_id)

                    sm_user = frappe.get_doc("Team Management", self.salesmanagerid)
                    if sm_user.user_id is not None and sm_user.user_id != '':
                        frappe.permissions.add_user_permission("VAT Filling Process", self.name, sm_user.user_id)
            else:
                if currVfp.salesmanagerid:
                    if self.canRevertPermission(currVfp.salesmanagerid) > 0:
                        curr_salesManager = frappe.get_doc("Team Management", currVfp.salesmanagerid)
                        if curr_salesManager.user_id is not None and curr_salesManager.user_id != '':
                            frappe.permissions.remove_user_permission("VAT Filling Process", self.name, curr_salesManager.user_id)
        else:
            # isnew = True
            if self.salesmanagerid is not None:
                ag_user = frappe.get_doc("Team Management", self.salesmanagerid)
                if ag_user.user_id is not None and ag_user.user_id != '':
                    frappe.permissions.add_user_permission("VAT Filling Process", self.name, ag_user.user_id)

    # Check CTM Permission
    def checkCTM(self, isnew):
        if not isnew:
            currVfp = frappe.get_doc("VAT Filling Process", self.name)
            if self.ctm_link != '' and self.ctm_link is not None:
                if self.ctm_link != currVfp.ctm_link:
                    if currVfp.ctmid:
                        if self.canRevertPermission(currVfp.ctmid) > 0:
                            curr_ctm_user = frappe.get_doc("Team Management", currVfp.ctmid)
                            if curr_ctm_user.user_id is not None and curr_ctm_user.user_id != '':
                                frappe.permissions.remove_user_permission("VAT Filling Process", self.name,
                                                                          curr_ctm_user.user_id)

                    ctm_user = frappe.get_doc("Team Management", self.ctm_link)
                    if ctm_user.user_id is not None and ctm_user.user_id != '':
                        frappe.permissions.add_user_permission("VAT Filling Process", self.name, ctm_user.user_id)
            else:
                if currVfp.ctm_link:
                    if self.canRevertPermission(currVfp.ctm_link) > 0:
                        ctm_user = frappe.get_doc("Team Management", currVfp.ctm_link)
                        if ctm_user.user_id is not None and ctm_user.user_id != '':
                            frappe.permissions.remove_user_permission("VAT Filling Process", self.name, ctm_user.user_id)
        else:
            # isnew = True
            if self.ctm_link is not None:
                ag_user = frappe.get_doc("Team Management", self.ctm_link)
                if ag_user.user_id is not None and ag_user.user_id != '':
                    frappe.permissions.add_user_permission("VAT Filling Process", self.name, ag_user.user_id)

    # Check KAM Permission
    def checkKAM(self, isnew):
        if not isnew:
            currVfp = frappe.get_doc("VAT Filling Process", self.name)
            if self.kamid != '' and self.kamid is not None:
                if self.kamid != currVfp.kamid:
                    if currVfp.kamid:
                        if self.canRevertPermission(currVfp.kamid) > 0:
                            curr_kam_user = frappe.get_doc("Team Management", currVfp.kamid)
                            if curr_kam_user.user_id is not None and curr_kam_user.user_id != '':
                                frappe.permissions.remove_user_permission("VAT Filling Process", self.name,
                                                                          curr_kam_user.user_id)

                    kam_user = frappe.get_doc("Team Management", self.kamid)
                    if kam_user.user_id is not None and kam_user.user_id != '':
                        frappe.permissions.add_user_permission("VAT Filling Process", self.name,
                                                               kam_user.user_id)
            else:
                if currVfp.kamid:
                    if self.canRevertPermission(currVfp.kamid) > 0:
                        kam_user = frappe.get_doc("Team Management", currVfp.kamid)
                        if kam_user.user_id is not None and kam_user.user_id != '':
                            frappe.permissions.remove_user_permission("VAT Filling Process", self.name,
                                                                      kam_user.user_id)
        else:
            # isnew = True
            if self.kamid is not None:
                ag_user = frappe.get_doc("Team Management", self.kamid)
                if ag_user.user_id is not None and ag_user.user_id != '':
                    frappe.permissions.add_user_permission("VAT Filling Process", self.name, ag_user.user_id)

    def checkProcessor(self, isnew):
        if not isnew:
            currvfp = frappe.get_doc("VAT Filling Process", self.name)
            if self.processorid != '' and self.processorid is not None:
                if self.processorid != currvfp.processorid:
                    if currvfp.processorid:
                        if self.canRevertPermission(currvfp.processorid) >0:
                            curr_processor_user = frappe.get_doc("Team Management", currvfp.processorid)
                            frappe.permissions.remove_user_permission("VAT Filling Process", self.name, curr_processor_user.user_id)

                    processor_user = frappe.get_doc("Team Management", self.processorid)
                    frappe.permissions.add_user_permission("VAT Filling Process", self.name, processor_user.user_id)
            else:
                if currvfp.processorid:
                    if self.canRevertPermission(currvfp.processorid) >0:
                        processor_user = frappe.get_doc("Team Management", currvfp.processorid)
                        frappe.permissions.remove_user_permission("VAT Filling Process", self.name, processor_user.user_id)
        else:
            # isnew = True
            if self.processorid is not None:
                ag_user = frappe.get_doc("Team Management", self.processorid)
                if ag_user.user_id is not None and ag_user.user_id != '':
                    frappe.permissions.add_user_permission("VAT Filling Process", self.name, ag_user.user_id)

    def checkCSR(self, isnew):
        if not isnew:
            currvfp = frappe.get_doc("VAT Filling Process", self.name)
            if self.csrid != '' and self.csrid is not None:
                if self.csrid != currvfp.csrid:
                    if currvfp.csrid:
                        if self.canRevertPermission(currvfp.csrid) >0:
                            curr_csr_user = frappe.get_doc("Team Management", currvfp.csrid)
                            frappe.permissions.remove_user_permission("VAT Filling Process", self.name, curr_csr_user.user_id)

                    csruser = frappe.get_doc("Team Management", self.csrid)
                    frappe.permissions.add_user_permission("VAT Filling Process", self.name, csruser.user_id)
            else:
                if currvfp.csrid:
                    if self.canRevertPermission(currvfp.csrid) >0:
                        curr_csr_user = frappe.get_doc("Team Management", currvfp.csrid)
                        frappe.permissions.remove_user_permission("VAT Filling Process", self.name, curr_csr_user.user_id)
        else:
            # isnew = True
            if self.csrid is not None:
                ag_user = frappe.get_doc("Team Management", self.csrid)
                if ag_user.user_id is not None and ag_user.user_id != '':
                    frappe.permissions.add_user_permission("VAT Filling Process", self.name, ag_user.user_id)

    def check_SrAuditor(self, isnew):
        if not isnew:
            currvfp = frappe.get_doc("VAT Filling Process", self.name)
            if self.sr_auditorid != '' and self.sr_auditorid is not None:
                if self.sr_auditorid != currvfp.sr_auditorid:
                    if currvfp.sr_auditorid:
                        if self.canRevertPermission(currvfp.sr_auditorid) > 0:
                            curr_srAuditor_user = frappe.get_doc("Team Management", currvfp.sr_auditorid)
                            frappe.permissions.remove_user_permission("VAT Filling Process", self.name, curr_srAuditor_user.user_id)

                    sr_rmuser = frappe.get_doc("Team Management", self.sr_auditorid)
                    frappe.permissions.add_user_permission("VAT Filling Process", self.name, sr_rmuser.user_id)
            else:
                if currvfp.sr_auditorid:
                    if self.canRevertPermission(currvfp.sr_auditorid) > 0:
                        sr_rmuser = frappe.get_doc("Team Management", currvfp.sr_auditorid)
                        frappe.permissions.remove_user_permission("VAT Filling Process", self.name, sr_rmuser.user_id)
        else:
            # isnew = True
            if self.sr_auditorid is not None:
                ag_user = frappe.get_doc("Team Management", self.sr_auditorid)
                if ag_user.user_id is not None and ag_user.user_id != '':
                    frappe.permissions.add_user_permission("VAT Filling Process", self.name, ag_user.user_id)

    def check_DEOIndoor(self, isnew):
        if not isnew:
            currvfp = frappe.get_doc("VAT Filling Process", self.name)
            if self.deo_indoor != '' and self.deo_indoor is not None:
                if self.deo_indoor != currvfp.deo_indoor:
                    if currvfp.deo_indoor:
                        if self.canRevertPermission(currvfp.deo_indoor) > 0:
                            curr_deoIndoor_user = frappe.get_doc("Team Management", currvfp.deo_indoor)
                            frappe.permissions.remove_user_permission("VAT Filling Process", self.name, curr_deoIndoor_user.user_id)

                    deo_indoor_user = frappe.get_doc("Team Management", self.deo_indoor)
                    frappe.permissions.add_user_permission("VAT Filling Process", self.name, deo_indoor_user.user_id)
            else:
                if currvfp.deo_indoor:
                    if self.canRevertPermission(currvfp.deo_indoor) > 0:
                        deo_indoor_user = frappe.get_doc("Team Management", currvfp.deo_indoor)
                        frappe.permissions.remove_user_permission("VAT Filling Process", self.name, deo_indoor_user.user_id)
        else:
            # isnew = True
            if self.deo_indoor is not None:
                ag_user = frappe.get_doc("Team Management", self.deo_indoor)
                if ag_user.user_id is not None and ag_user.user_id != '':
                    frappe.permissions.add_user_permission("VAT Filling Process", self.name, ag_user.user_id)

    def check_DEO_Outdoor(self, isnew):
        if not isnew:
            currvfp = frappe.get_doc("VAT Filling Process", self.name)
            if self.deo_outdoor != '' and self.deo_outdoor is not None:
                if self.deo_outdoor != currvfp.deo_outdoor:
                    if currvfp.deo_outdoor:
                        if self.canRevertPermission(currvfp.deo_outdoor) > 0:
                            curr_deoIndoor_user = frappe.get_doc("Team Management", currvfp.deo_outdoor)
                            frappe.permissions.remove_user_permission("VAT Filling Process", self.name, curr_deoIndoor_user.user_id)

                    deo_indoor_user = frappe.get_doc("Team Management", self.deo_outdoor)
                    frappe.permissions.add_user_permission("VAT Filling Process", self.name, deo_indoor_user.user_id)
            else:
                if currvfp.deo_outdoor:
                    if self.canRevertPermission(currvfp.deo_outdoor) > 0:
                        deo_indoor_user = frappe.get_doc("Team Management", currvfp.deo_outdoor)
                        frappe.permissions.remove_user_permission("VAT Filling Process", self.name, deo_indoor_user.user_id)
        else:
            # isnew = True
            if self.deo_outdoor is not None:
                ag_user = frappe.get_doc("Team Management", self.deo_outdoor)
                if ag_user.user_id is not None and ag_user.user_id != '':
                    frappe.permissions.add_user_permission("VAT Filling Process", self.name, ag_user.user_id)

    def validate(self):
        clientacAcknowledgement = 0
        clientVATInfo = 0
        vatPaymentVoucher = 0
        msg = ''
        vat_filling_month = format(datetime.strptime(str(self.vat_filling_date), '%Y-%m-%d').date().month,'02') +'-'+str(datetime.strptime(str(self.vat_filling_date), '%Y-%m-%d').date().year)
        # vfpdoc = frappe.get_list("VAT Filling Process", filters={"business_id": self.business_id, "vat_filling_date": self.vat_filling_date})
        vfpdoc = frappe.db.sql("""SELECT
                *
            FROM
                `tabVAT Filling Process`
            WHERE
                business_id = '{0}'
                and docstatus <> 2
                AND DATE_FORMAT( vat_filling_date, "%m-%Y" ) = {1}""" .format(self.business_id,vat_filling_month), as_dict=1)
        if len(vfpdoc) > 1:
            frappe.throw("A record of Organization "+self.business_id+" already available in this filing month")

        if self.workflow_state != 'Move to BackOffice':
            if self.email_address == None or self.email_address == '':
                frappe.throw("Please enter Email Address")

        self.validate_MovetoBackOffice()
        self.validate_DEO_Outdoor()
        self.validate_DEO_Assign_Disposition()

        if self.workflow_state == 'QC 2':
            self.validate_qc2_fields()

        if self.workflow_state == 'Client Confirmation':
            self.validate_qc2_fields()
            if self.validate_ClientVATInfo() == 1:
                clientVATInfo = 1
            else:
                msg += 'Please Attach Client VAT Info Document\n'
            if clientVATInfo == 1:
                pass
            else:
                frappe.throw(msg)

        if self.workflow_state == 'Self Filed by Client' or self.workflow_state == 'Submit Filing in FTA' or self.workflow_state == 'Return Filing Completed':
            self.validate_qc2_fields()
            if self.validate_ClientVATInfo() == 1:
                clientVATInfo = 1
            else:
                msg += 'Please Attach Client VAT Info Document\n'
            if self.validate_ClientAcknowledgementDocument() == 1:
                clientacAcknowledgement = 1
            else:
                msg += 'Please Attach Client Acknowledgement Document\n'
            if clientVATInfo == 1 and clientacAcknowledgement == 1:
                pass
            else:
                frappe.throw(msg)

        if self.vps_account:
            self.validate_VatFrequency()

    def validate_MovetoBackOffice(self):
        if self.workflow_state != 'Move to BackOffice':
            if self.rmid == '' or self.rmid == None:
                frappe.throw("Please select a Auditor before stage change")

            if self.sr_auditorid == '' or self.sr_auditorid == None:
                frappe.throw("Please select a Sr Auditor before stage change")

            if self.deo_indoor == '' or self.deo_indoor == None:
                frappe.throw("Please select a DEO Indoor before stage change")

    def validate_DEO_Outdoor(self):
        if self.workflow_state == 'Assigned to DEO Outdoor':
            if self.deo_outdoor == '' or self.deo_outdoor == None:
                frappe.throw("Please select a DEO Outdoor before stage change")

    def validate_DEO_Assign_Disposition(self):
        if self.currentstage == 'Assigned to DEO Outdoor' and self.workflow_state == 'Data Entry and Report Preparation':
            if self.disposition_assign_deo != 'Task completed':
                frappe.throw("Please select a Disposition assign to DEO Task Complete before stage change")

    def validate_qc2_fields(self):
        if self.gban_number == '' or self.gban_number == None:
            frappe.throw("Please enter GIBAN Number before stage change.")

        if self.sale_invoice_amount == '' or self.sale_invoice_amount == None:
            frappe.throw("Please enter Sale Invoice Amount before stage change")

        if self.purchase_invoice_amount == '' or self.purchase_invoice_amount == None:
            frappe.throw("Please enter Purchase Invoice Amount before stage change")

        if self.total_vat_amount == '' or self.total_vat_amount == None:
            frappe.throw("Please enter VAT Amount before stage change")

    def validate_ClientVATInfo(self):
        available = 0
        for singleDocument in self.office:
            document_type = frappe.get_doc("Document Type", singleDocument.document_type)
            if document_type.document_name == 'Client VAT Info':  # Client VAT Info
                available = 1;
        return available

    def validate_ClientAcknowledgementDocument(self):
        available = 0
        for singleDocument in self.office:
            document_type = frappe.get_doc("Document Type",singleDocument.document_type)
            if document_type.document_name == 'Client Acknowledgement Document':  # Client Acknowledgement Document
                available = 1;
        return available


    def on_update(self):

        global isnew
        if isnew:
            self.validateStageConditions(isnew)
        if self.workflow_state == 'Data Entry and Report Preparation':
            teamuser = frappe.get_doc("Team Management", self.rmid)
            frappe.permissions.add_user_permission("VAT Filling Process", self.name, teamuser.user_id)
            if self.filing_type == 'VPS Filing':
                if self.stagechanged == 1:
                    self.auditor_assigned_mail()


        # elif self.workflow_state == 'QC 1':
        #     processor_user = frappe.get_doc("Team Management", self.processorid)
        #     frappe.permissions.add_user_permission("VAT Filling Process", self.name, processor_user.user_id)
        #
        #     csruser = frappe.get_doc("Team Management", self.csrid)
        #     frappe.permissions.add_user_permission("VAT Filling Process", self.name, csruser.user_id)

        elif self.workflow_state == 'Data Awaited from Client':
            if self.stagechanged == 1:
                self.data_awaited_from_client_mail()

        elif self.workflow_state == 'FTA Credentials Required':
            if self.stagechanged == 1:
                self.fta_credential_required_mail()

        elif self.workflow_state == 'Client Confirmation':
            if self.filing_type == 'VPS Filing':
                if self.stagechanged == 1:
                    self.client_confirmation_mail()

        # elif self.workflow_state == 'Return Filing Completed':
        elif self.workflow_state == 'Return Submitted to FTA':
            if self.stagechanged == 1:
                self.return_filling_complete_mail()

            self.updateVatSchedule()

        elif self.workflow_state == 'Self Filed by Client':
            if self.stagechanged == 1:
                self.self_filed_by_client_mail()
            self.updateVatSchedule()

        elif self.workflow_state == 'Assigned to DEO Manager':
            if self.stagechanged == 1:
                self.deo_assigned_mail()

        elif self.workflow_state == 'Assigned to DEO Outdoor':
            if self.stagechanged == 1:
                self.deo_outdoor_assigned_mail()

        if self.stagechanged == 1:
            self.createVFPlog()

    def updateVatSchedule(self):
        if self.vps_account != '' and self.vps_account != None:
            date_vat = datetime.strptime(self.vat_filling_date, '%Y-%m-%d').date()
            filing_type = self.filing_type
            vfpname = self.name

            frappe.db.sql(
                """update `tabVat Submission Schedule` set `vfp_name` = '%s', `filling_type` = '%s', `vatfile` = 1 where parent = '%s' and vatsubmissiondate = '%s'""" % (
                    vfpname, filing_type, self.name, date_vat))

            orgdoc = frappe.get_doc("Organization", self.business_id)
            frappe.db.sql(
                """update `tabVat Submission Schedule` set `vfp_name` = '%s', `filling_type` = '%s', `vatfile` = 1 where parent = '%s' and vatsubmissiondate = '%s'""" % (
                    vfpname, filing_type, orgdoc.name, date_vat))

            ftadoc = frappe.get_list("FTA Registration Process", filters={"organizationid": self.business_id})
            if len(ftadoc) > 0:
                frappe.db.sql(
                    """ update `tabVat Submission Schedule` set `vfp_name` = '%s', `filling_type` = '%s', `vatfile` = 1 where parent = '%s' and vatsubmissiondate = '%s'""" % (
                        vfpname, filing_type, ftadoc[0].name, date_vat))

            vatdoc = frappe.get_list("VAT Processing System", filters={"organizationid": self.business_id})
            if len(vatdoc) > 0:
                frappe.db.sql(
                    """ update `tabVat Submission Schedule` set `vfp_name` = '%s', `filling_type` = '%s', `vatfile` = 1 where parent = '%s' and vatsubmissiondate = '%s'""" % (
                        vfpname, filing_type, vatdoc[0].name, date_vat))

    def validate_VATPaymentVoucher(self):
        available = 0
        for singleDocument in self.office:
            document_type = frappe.get_doc("Document Type", singleDocument.document_type)
            if document_type.document_name == 'VAT Payment Voucher':  # VAT Payment Voucher
                available = 1;
        return available

    def before_submit(self):
        if self.currentstage != self.workflow_state:
            self.currentstage = self.workflow_state
            self.cur_wf_date = utils.today()
            self.stagechanged = 1

            self.createVFPlog()

    def on_submit(self):
        # filing complete check for vps account and update all schedule related to this organization i.e fta and vps
        if self.workflow_state == 'Return Filing Completed' and self.filing_type == 'VPS Filing':
            issubmitted = False
            if self.vps_account != '' and self.vps_account != None:
                date_vat = datetime.strptime(self.vat_filling_date, '%Y-%m-%d').date()
                filing_type = self.filing_type
                vfpname = self.name

                frappe.db.sql(
                    """update `tabVat Submission Schedule` set `vfp_name` = '%s', `filling_type` = '%s', `vatfile` = 1, `vatsubmitted` = 1 where parent = '%s' and vatsubmissiondate = '%s'""" % (
                        vfpname, filing_type, self.name, date_vat))

                orgdoc = frappe.get_doc("Organization", self.business_id)
                frappe.db.sql(
                    """update `tabVat Submission Schedule` set `vfp_name` = '%s', `filling_type` = '%s', `vatfile` = 1, `vatsubmitted` = 1 where parent = '%s' and vatsubmissiondate = '%s'""" % (
                        vfpname, filing_type, orgdoc.name, date_vat))

                ftadoc = frappe.get_list("FTA Registration Process", filters={"organizationid": self.business_id})
                if len(ftadoc) > 0:
                    frappe.db.sql(
                        """ update `tabVat Submission Schedule` set `vfp_name` = '%s', `filling_type` = '%s', `vatfile` = 1, `vatsubmitted` = 1 where parent = '%s' and vatsubmissiondate = '%s'""" % (
                            vfpname, filing_type, ftadoc[0].name, date_vat))

                vatdoc = frappe.get_list("VAT Processing System", filters={"organizationid": self.business_id})
                if len(vatdoc) > 0:
                    frappe.db.sql(
                        """ update `tabVat Submission Schedule` set `vfp_name` = '%s', `filling_type` = '%s', `vatfile` = 1, `vatsubmitted` = 1 where parent = '%s' and vatsubmissiondate = '%s'""" % (
                            vfpname, filing_type, vatdoc[0].name, date_vat))
                    
        ### send feedback email
        if self.workflow_state == 'Return Filing Completed':
            if self.filing_type != 'Manual Filing':
                from vat.sales.doctype.survey.survey import saveSurveyData
                saveSurveyData(self)


    def deleteOldSchedule(self):
        to_remove = []
        for d in self.get("vatschedule"):
            if d.vatsubmitted == 0:
                to_remove.append(d)
            else:
                vatcheck = 0
                vatcond = False
                for j in self.get("vatschedule"):
                    if d.vatsubmissiondate == j.vatsubmissiondate:
                        vatcheck = vatcheck + 1
                        vatcond = True
                    else:
                        vatcond = False

                    if vatcheck > 1 and vatcond:
                        self.remove(j)
                        # d.save()
                # [self.remove(j) for j in to_remove]

        # d.save()
        [self.remove(d) for d in to_remove]

    # self.db_update()

    def manualFillingSchedule(self):
        filing_date = datetime.strptime(self.vat_filling_date, '%Y-%m-%d').date()
        filing_type = self.filing_type

        orgdoc = frappe.get_doc("Organization", self.business_id)
        d = orgdoc.append('vatschedule', {})
        d.vatsubmissiondate = filing_date
        d.vfp_name = self.name
        d.filling_type = filing_type
        d.vatfile = 0
        d.vatsubmitted = 0
        d.db_update()

        vpslist = frappe.get_list("VAT Processing System", filters={"organizationid": self.business_id})
        if len(vpslist) > 0:
            vpsdoc = frappe.get_doc("VAT Processing System", vpslist[0].name)
            d = vpsdoc.append('vatschedule', {})
            d.vatsubmissiondate = filing_date
            d.vfp_name = self.name
            d.filling_type = filing_type
            d.vatfile = 0
            d.vatsubmitted = 0
            d.db_update()

        ftalist = frappe.get_list("FTA Registration Process", filters={"organizationid": self.business_id})
        if len(ftalist) > 0:
            ftadoc = frappe.get_doc("FTA Registration Process", ftalist[0].name)
            d = ftadoc.append('vatschedule', {})
            d.vatsubmissiondate = filing_date
            d.vfp_name = self.name
            d.filling_type = filing_type
            d.vatfile = 0
            d.vatsubmitted = 0
            d.db_update()

        frappe.db.commit()

    def generateSchedule(self, schedulecheck = False, generateTable = True):
        if generateTable:
            if schedulecheck:
                frappe.db.sql("""delete from `tabVat Submission Schedule` where parent = '%s'""" % self.name)
            else:
                # pass
                self.deleteOldSchedule()
            totalGeneration = 11

            if isinstance(self.vatsubmissiondate, basestring):
                firstdate = datetime.strptime(self.vatsubmissiondate, '%Y-%m-%d')
                nextdate = datetime.date(firstdate)
            else:
                firstdate = self.vatsubmissiondate
                nextdate = firstdate
            currdate = nextdate
            if self.vatfrequency == 'Monthly':
                totalGeneration = 12
                alldates = []
                alldates.append(currdate)
                for a in range(1, totalGeneration):
                    nextdate = self.add_months(currdate, a)
                    nextdate = datetime.strptime(str(nextdate), '%Y-%m-%d').date()
                    alldates.append(nextdate)

                for date in alldates:
                    datecheck = False

                    for a in self.vatschedule:

                        checkeddate = datetime.strptime(str(a.vatsubmissiondate), '%Y-%m-%d').date()
                        if checkeddate == date:
                            datecheck = True
                            break

                    if datecheck == False:
                        d = self.append('vatschedule', {})
                        d.vatsubmissiondate = date
                        d.vatsubmitted = 0
                        # d.db_update()

                count = 1
                for a in self.vatschedule:
                    a.idx = count
                    count = count + 1
                    # a.db_update()

            elif self.vatfrequency == 'Quarterly':
                totalGeneration = 4
                quarter = 3
                alldates = []
                alldates.append(currdate)

                for a in range(1, totalGeneration):
                    nextdate = self.add_months(currdate, a * quarter)
                    nextdate = datetime.strptime(str(nextdate), '%Y-%m-%d').date()
                    alldates.append(nextdate)

                for date in alldates:
                    datecheck = False

                    for a in self.vatschedule:
                        checkeddate = datetime.strptime(str(a.vatsubmissiondate), '%Y-%m-%d').date()
                        if checkeddate == date:
                            datecheck = True
                            break

                    if datecheck == False:
                        d = self.append('vatschedule', {})
                        d.vatsubmissiondate = date
                        d.vatsubmitted = 0
                        # d.db_update()

                count = 1
                for a in self.vatschedule:
                    a.idx = count
                    count = count + 1
                    # a.db_update()
                # frappe.db.commit()
        else:
            frappe.db.sql("""delete from `tabVat Submission Schedule` where parent = '%s'""" % self.name)

    def updateOrganization(self):
        doclist = frappe.get_list("Organization", filters={"name": self.business_id})
        if len(doclist) > 0:
            doc = frappe.get_doc("Organization",self.business_id)
            doc.gban_number = self.gban_number
            doc.whatsapp_number = self.whatsapp_number
            doc.save(ignore_permissions=True)

    def updateFTA(self):
        doclist = frappe.get_list("FTA Registration Process",filters = {"organizationid":self.business_id})
        if len(doclist) > 0:
            doc = frappe.get_doc("FTA Registration Process",doclist[0].name)
            doc.gban_number = self.gban_number
            doc.save()

    def add_months(self, sourcedate, months):
        import calendar
        month = sourcedate.month - 1 + months
        year = sourcedate.year + month // 12
        month = month % 12 + 1
        day = calendar.monthrange(year, month)[1]
        # day = max(sourcedate.day,calendar.monthrange(year,month)[1])
        nextdate = str(year) + "-" + str(month).zfill(2) + "-" + str(day).zfill(2)
        return nextdate

    def validate_VatFrequency(self):
        vatdoc=frappe.get_doc("VAT Processing System", self.vps_account)
        if vatdoc.vatfrequency is None or vatdoc.vatfrequency == '':
            frappe.throw("Please enter VAT frequency")
        elif vatdoc.vatsubmissiondate is None or vatdoc.vatsubmissiondate == '':
            frappe.throw("Please enter VAT submission date")

    # def rm_assign_mail(self):
    #     subject = self.business_id + ': VAT FILING Assigned to Auditor'
    #     template = "templates/emails/client_email_assign_to_rm.html"
    #
    #     delta = 0
    #     if self.vps_account:
    #         vatdoc = frappe.get_doc("VAT Processing System",self.vps_account)
    #         if vatdoc.vatfrequency is not None and vatdoc.vatfrequency != '':
    #             if vatdoc.vatfrequency == 'Monthly':
    #                 delta = relativedelta(days=1)
    #             elif vatdoc.vatfrequency == 'Quarterly':
    #                 delta = relativedelta(months=3)
    #     else:
    #         delta = relativedelta(months=3)
    #     frequencyDate = datetime.strptime(str(self.vat_filling_date), '%Y-%m-%d').date() - delta
    #
    #     duedate_seven = str(self.vat_filing_due_date)
    #     duedate_seven = datetime.strptime(duedate_seven, '%Y-%m-%d').strftime('7th %B %Y')
    #     newdateformat = datetime.strptime(str(self.vat_filing_due_date), '%Y-%m-%d').strftime('%d %B %Y')
    #
    #     rmdata = frappe.get_doc("Team Management", self.rmid)
    #
    #     args = {
    #         'fillingdate': newdateformat,  # vat filing date
    #         'duedate': duedate_seven,  # vat filing due date
    #         'rmName': self.rm_name,  # rm name
    #         'email': rmdata.email_address,  # email
    #         'landline': rmdata.directnumber,  # landline
    #         'spocname': self.spoc_name,
    #     }
    #
    #     user_email = self.email_address.encode('ascii', 'ignore')
    #     cc = ['s.notification@mavensolutions.net'.encode('ascii', 'ignore'),
    #           'usman.aziz@skylines.ae'.encode('ascii', 'ignore'),
    #           'vat.processing@skylines.ae'.encode('ascii', 'ignore'), rmdata.email_address]
    #     cc = []
    #
    #     STANDARD_USERS = ("Guest", "Administrator")
    #     sender = frappe.session.user not in STANDARD_USERS and get_formatted_email(frappe.session.user) or None
    #     sender = "SkylinesVAT <info@skylinesalert.net>"
    #     self.sendvfpmail(email_address=user_email, subject=subject, template=template, args=args, sender=sender, cc=cc)
    #
    # def submitted_fta_mail(self):
    #     subject = self.business_id + ': VAT FILING Submitted TO FTA Portal'
    #     template = "templates/emails/client_email_submit_to_fta.html"
    #
    #     # onelessduedate = self.vat_filing_due_date - relativedelta(days=1)
    #     onelessduedate = datetime.strptime(str(self.vat_filing_due_date), '%Y-%m-%d').strftime('%d %B %Y')
    #
    #     args = {
    #         'date1': onelessduedate,
    #         'ftaid': self.tax_user_name,
    #         'ftapassword': self.taxpassword,
    #         'trn': self.trn_number,
    #         'giban': self.gban_number,
    #         'spocname': self.spoc_name,
    #         'outstanding': self.outstanding_amount,
    #
    #     }
    #     rmdata = frappe.get_doc("Team Management", self.rmid)
    #     user_email = self.email_address
    #     # user_email = 'saqib.rupani@mavensolutions.net'.encode('ascii', 'ignore')
    #     cc = ['s.notification@mavensolutions.net'.encode('ascii', 'ignore'),'usman.aziz@skylines.ae'.encode('ascii', 'ignore'),'vat.processing@skylines.ae'.encode('ascii', 'ignore'),rmdata.email_address]
    #
    #     STANDARD_USERS = ("Guest", "Administrator")
    #     sender = frappe.session.user not in STANDARD_USERS and get_formatted_email(frappe.session.user) or None
    #     sender = "SkylinesVAT <info@skylinesalert.net>"
    #
    #     # ccemail = [teamInformation[0][0], '​s.notification@mavensolutions.net'.encode('ascii', 'ignore')]
    #
    #     self.sendvfpmail(email_address=user_email, subject=subject, template=template, args=args, sender=sender, cc=cc)
    #     sms_msg = """Dear Customer,
    #                 Your VAT Filing is completed. Please check your VAT Payable Amount and pay at your earliest.
    #                 Payment can be done online on FTA through E-Dirham/Master/Visa card Or visit Al Ansari Exchange.
    #
    #                 SKYLINES TAX CONSULTANCY
    #                 042190778"""
    #     self.sendsms(sms_msg)


    def getFile(self, attachment):
        import string
        available = 0
        filename = ''
        filename = string.replace(attachment,'/files/','')
        # fullfilename = attachment

        fullfilename = 'public/files/'+filename
        path = frappe.get_site_path(filename,)
        path = string.replace(path,filename,fullfilename)
        with open(path, "rb") as fileobj:
            filedata = fileobj.read()

        out = {
            "fname": filename,
            "fcontent": filedata
        }
        return out

    def deo_assigned_mail(self):
        subject = self.business_id + ': '+ self.name +' - Assigned To DEO'
        template = "templates/emails/assigned_to_deo_email.html"

        args = {
            'docname': self.name,
            'hostname':frappe.conf.get('host_name')
        }
        deo_manager = frappe.get_doc("Team Management", getDefaults().deo_manager)
        user_email = deo_manager.email_address
        cc = ['s.notification@mavensolutions.net'.encode('ascii', 'ignore')]

        STANDARD_USERS = ("Guest", "Administrator")
        sender = "SkylinesVAT <info@skylinesalert.net>"

        self.sendvfpmail(email_address=user_email, subject=subject, template=template, args=args, sender=sender, cc=cc)

    def deo_outdoor_assigned_mail(self):
        subject = self.business_id + ': '+ self.name +' - Assigned To DEO Outdoor'
        template = "templates/emails/assigned_to_deo_outdoor_email.html"

        args = {
            'docname': self.name,
            'hostname':frappe.conf.get('host_name')
        }
        deo_outdoor = frappe.get_doc("Team Management", self.deo_outdoor)
        user_email = deo_outdoor.email_address

        cc = ['s.notification@mavensolutions.net'.encode('ascii', 'ignore')]
        cc = []

        STANDARD_USERS = ("Guest", "Administrator")
        sender = "SkylinesVAT <info@skylinesalert.net>"

        self.sendvfpmail(email_address=user_email, subject=subject, template=template, args=args, sender=sender, cc=cc)


    def auditor_assigned_mail(self):
        subject = self.business_id + ': ' + self.name + ' - Assigned to Auditor'
        template = "templates/emails/assigned_to_auditor.html"

        rmdata = frappe.get_doc("Team Management", self.rmid)

        if rmdata.contact_number is not None and rmdata.contact_number != '':
            rm_contact = rmdata.contact_number
        else:
            rm_contact = ''

        if rmdata.directnumber is not None and rmdata.directnumber != '':
            landline = rmdata.directnumber
        else:
            landline = ''

        args = {
            'spocname': self.spoc_name,
            'urlLink': self.appurl,
            'userID': self.tax_user_name,
            'rmName': self.rm_name,
            'email': rmdata.email_address,
            'landline': landline,
            'ext': rmdata.extno,
            'contact_no': rm_contact
        }

        user_email = self.email_address.encode('ascii', 'ignore')
        cc = ['s.notification@mavensolutions.net'.encode('ascii', 'ignore'),
              'usman.aziz@skylines.ae'.encode('ascii', 'ignore'),
              'vat.processing@skylines.ae'.encode('ascii', 'ignore'), rmdata.email_address]

        STANDARD_USERS = ("Guest", "Administrator")
        sender = frappe.session.user not in STANDARD_USERS and get_formatted_email(frappe.session.user) or None
        sender = "SkylinesVAT <info@skylinesalert.net>"
        self.sendvfpmail(email_address=user_email, subject=subject, template=template, args=args, sender=sender, cc=cc)

        sms_msg = """Welcome to STC, we have assigned an Auditor for your VAT filing.
                    For details pls call your auditor/customer care @600575550 (Sat-Thu) b/w 09:00AM–06:00PM."""

        self.sendsms(sms_msg)

    def client_confirmation_mail(self):
        subject = self.business_id + ': ' + self.name + ' - Client Confirmation'
        template = "templates/emails/client_email_sent_for_confirmation.html"

        # delta = 0
        # if self.vps_account:
        #     vatdoc = frappe.get_doc("VAT Processing System", self.vps_account)
        #     if vatdoc.vatfrequency is not None and vatdoc.vatfrequency != '':
        #         if vatdoc.vatfrequency == 'Monthly':
        #             delta = relativedelta(days=1)
        #         elif vatdoc.vatfrequency == 'Quarterly':
        #             delta = relativedelta(months=3)
        # else:
        #     delta = relativedelta(months=3)
        # frequencyDate = datetime.strptime(str(self.vat_filling_date), '%Y-%m-%d').date() - delta

        rmdata = frappe.get_doc("Team Management", self.rmid)

        args = {
            'auditor_name': rmdata.team_management_name,
            'email': rmdata.email_address,
            'landline': rmdata.contact_number
        }

        attach = self.office
        files = []

        for file in attach:
            if file.document_name == 'Client VAT Info':
                file_name = file.attachment
                file_name = self.getFile(file_name)
                # file_name = file_name.split("/")[2]
                filename = {"fname": file_name['fname'],
                "fcontent": file_name['fcontent'],
                "content_type": 'application/octet-stream'}
                files.append(filename)

        user_email = self.email_address.encode('ascii', 'ignore')
        cc = ['s.notification@mavensolutions.net'.encode('ascii', 'ignore'),
              'usman.aziz@skylines.ae'.encode('ascii', 'ignore'),
              'vat.processing@skylines.ae'.encode('ascii', 'ignore'), rmdata.email_address]

        STANDARD_USERS = ("Guest", "Administrator")
        sender = frappe.session.user not in STANDARD_USERS and get_formatted_email(frappe.session.user) or None
        sender = "SkylinesVAT <info@skylinesalert.net>"

        # ccemail = [teamInformation[0][0], '​s.notification@mavensolutions.net'.encode('ascii', 'ignore')]
        self.sendvfpmail(email_address=user_email, subject=subject, template=template, args=args, sender=sender, cc=cc, attach=files)

        sms_msg = """Confirmation awaited for VAT filing, pls revert at the earliest to process your VAT return.
                    Pls call auditor/CC @600575550 (Sat–Thu) b/w 09:00AM – 06:00PM."""

        self.sendsms(sms_msg)

    def data_awaited_from_client_mail(self):
        subject = self.business_id + ': ' + self.name + ' - Data Awaited from Client'
        template = "templates/emails/data_awaited_from_client.html"

        args = {
            'spocname': self.spoc_name
        }

        rmdata = frappe.get_doc("Team Management", self.rmid)
        user_email = self.email_address
        cc = ['s.notification@mavensolutions.net'.encode('ascii', 'ignore'),
              'usman.aziz@skylines.ae'.encode('ascii', 'ignore'),
              'vat.processing@skylines.ae'.encode('ascii', 'ignore'), rmdata.email_address]

        STANDARD_USERS = ("Guest", "Administrator")
        sender = frappe.session.user not in STANDARD_USERS and get_formatted_email(frappe.session.user) or None
        sender = "SkylinesVAT <info@skylinesalert.net>"

        self.sendvfpmail(email_address=user_email, subject=subject, template=template, args=args, sender=sender, cc=cc)

        sms_msg = """Pls update the data at earliest for your VAT filing to avoid further consequences with FTA."""

        self.sendsms(sms_msg)

    def fta_credential_required_mail(self):
        subject = self.business_id + ': '+ self.name +' - FTA Credentials Required'
        template = "templates/emails/fta_credential_required.html"

        args = {
            'spocname': self.spoc_name
        }

        rmdata = frappe.get_doc("Team Management", self.rmid)
        user_email = self.email_address
        cc = ['s.notification@mavensolutions.net'.encode('ascii', 'ignore'),
              'usman.aziz@skylines.ae'.encode('ascii', 'ignore'),
              'vat.processing@skylines.ae'.encode('ascii', 'ignore'), rmdata.email_address]

        STANDARD_USERS = ("Guest", "Administrator")
        sender = frappe.session.user not in STANDARD_USERS and get_formatted_email(frappe.session.user) or None
        sender = "SkylinesVAT <info@skylinesalert.net>"

        self.sendvfpmail(email_address=user_email, subject=subject, template=template, args=args, sender=sender, cc=cc)

        sms_msg = """We are unable to access your FTA account.
                    Pls call immediately to your auditor/customer care @600575550 (Sat-Thu) b/w 09:00AM–06:00PM."""

        self.sendsms(sms_msg)

    def self_filed_by_client_mail(self):
        subject = self.business_id + ': '+ self.name +' - Self Filed by Client'
        template = "templates/emails/self_filed_by_client.html"

        args = {
            'spocname': self.spoc_name
        }

        rmdata = frappe.get_doc("Team Management", self.rmid)
        user_email = self.email_address
        cc = ['s.notification@mavensolutions.net'.encode('ascii', 'ignore'),
              'usman.aziz@skylines.ae'.encode('ascii', 'ignore'),
              'vat.processing@skylines.ae'.encode('ascii', 'ignore'), rmdata.email_address]

        STANDARD_USERS = ("Guest", "Administrator")
        sender = frappe.session.user not in STANDARD_USERS and get_formatted_email(frappe.session.user) or None
        sender = "SkylinesVAT <info@skylinesalert.net>"

        self.sendvfpmail(email_address=user_email, subject=subject, template=template, args=args, sender=sender, cc=cc)

        sms_msg = """Pls note that we haven't filed your VAT return as its already done by your end 
                    In case you are not aware of this pls immediately call auditor/CC @600575550."""

        self.sendsms(sms_msg)

    def return_filling_complete_mail(self):
        subject = self.business_id + ': '+ self.name +' - Return Submitted to FTA'
        template = "templates/emails/return_filling_complete.html"

        args = {
            'user_id': self.tax_user_name,
            'password': self.taxpassword,
            'trn_number': self.trn_number,
            'gban': self.gban_number,
            'spocname': self.spoc_name,
            'outstanding': self.outstanding_amount
        }

        rmdata = frappe.get_doc("Team Management", self.rmid)
        user_email = self.email_address
        cc = ['s.notification@mavensolutions.net'.encode('ascii', 'ignore'),
              'usman.aziz@skylines.ae'.encode('ascii', 'ignore'),
              'vat.processing@skylines.ae'.encode('ascii', 'ignore'), rmdata.email_address]

        STANDARD_USERS = ("Guest", "Administrator")
        sender = frappe.session.user not in STANDARD_USERS and get_formatted_email(frappe.session.user) or None
        sender = "SkylinesVAT <info@skylinesalert.net>"

        self.sendvfpmail(email_address=user_email, subject=subject, template=template, args=args, sender=sender, cc=cc)

        sms_msg = """Your VAT return has been submitted in FTA as per the confirmation provided to us for details please call auditor/CC @600575550 (Sat-Thu) b/w 09:00AM–06:00PM."""

        self.sendsms(sms_msg)

    def vfp_reminder_mail(self):
        subject = self.business_id + ': ' + self.name + ' - Reminder Mail'
        template = "templates/emails/vfp_reminder_email.html"

        args = {
            'spocname': self.spoc_name
        }

        rmdata = frappe.get_doc("Team Management", self.rmid)
        user_email = self.email_address
        cc = ['s.notification@mavensolutions.net'.encode('ascii', 'ignore'),
              'usman.aziz@skylines.ae'.encode('ascii', 'ignore'),
              'vat.processing@skylines.ae'.encode('ascii', 'ignore'), rmdata.email_address]

        STANDARD_USERS = ("Guest", "Administrator")
        sender = frappe.session.user not in STANDARD_USERS and get_formatted_email(frappe.session.user) or None
        sender = "SkylinesVAT <info@skylinesalert.net>"

        self.sendvfpmail(email_address=user_email, subject=subject, template=template, args=args, sender=sender, cc=cc)

        message = """Dear """ + self.spoc_name + """,\n\n We truly understand that you might be busy with your work and didn't found time to check mail. 
            That's okay. We would be happy to hear from you regarding our previous email. 
            You are requested to reply to this email on the above subject at the earliest so we can expedite
            the VAT filing for the current quarter in order to avoid late penalty due to late submission.\n\nHope to hear from you soon.\n\nThanks for choosing Skylines Tax Consultancy"""

        self.add_comment('Comment', message)

    def non_responsive_mail(self):
        subject = self.business_id + ': ' + self.name + ' - Non Responsive Client'
        template = "templates/emails/non_responsive_client.html"

        rmdata = frappe.get_doc("Team Management", self.rmid)

        if rmdata.contact_number is not None and rmdata.contact_number != '':
            rm_contact = rmdata.contact_number
        else:
            rm_contact = ''

        if self.land_line is not None and self.land_line != '':
            landline = self.land_line
        else:
            landline = ''

        args = {
            'spocname': self.spoc_name,
            'landline': landline,
            'mobile_no': self.mobile_number,
            'auditor_no': rm_contact
        }

        user_email = self.email_address.encode('ascii', 'ignore')
        cc = ['s.notification@mavensolutions.net'.encode('ascii', 'ignore'),
              'usman.aziz@skylines.ae'.encode('ascii', 'ignore'),
              'vat.processing@skylines.ae'.encode('ascii', 'ignore'), rmdata.email_address]

        STANDARD_USERS = ("Guest", "Administrator")
        sender = frappe.session.user not in STANDARD_USERS and get_formatted_email(frappe.session.user) or None
        sender = "SkylinesVAT <info@skylinesalert.net>"

        self.sendvfpmail(email_address=user_email, subject=subject, template=template, args=args, sender=sender, cc=cc)

        message = """Dear """ + self.spoc_name + """,\n\n Hope you’re doing well.\n\n In order to get in touch with you.
                    We tried contacting you on """ + landline + """ & """ + self.mobile_number + """ however, couldn’t get through.
                    Request you to connect us on """ + rm_contact + """, to resolve your queries(if any) and expedite your VAT filing process
                    to avoid late submission consequences.\n\n We are available from 09:00am to 06:00pm from Sat-Thu\n\n Hope to hear from you soon."""

        self.add_comment('Comment', message)

    def sendvfpmail(self, email_address, subject, template, args, sender, cc=None ,now=None, attach=None ):
        if attach is not None:
            frappe.sendmail(recipients=email_address, sender=sender, subject=subject,
                            message=frappe.get_template(template).render(args), cc=cc,
                            delayed=(not now) if now != None else self.flags.delay_emails, retry=3, attachments=attach)
        else:
            frappe.sendmail(recipients=email_address, sender=sender, subject=subject,
                            message=frappe.get_template(template).render(args), cc=cc,
                            delayed=(not now) if now != None else self.flags.delay_emails, retry=3)

    def sendsms(self, message):
        # mnumber = '971' + self.mobile_number[1:/]
        # arguments = {}
        # arguments['username'] = 'websms'
        # arguments['password'] = 'websms'
        # arguments['to'] = mnumber
        # arguments['from'] = '800UAEVAT'
        # arguments['text'] = message
        # mnumber = '971' + self.mobile_number[1:/]
        mnumber = self.mobile_number
        arguments = {}

        arguments['type'] = 0
        arguments['dlr'] = 1
        arguments['destination'] = mnumber
        arguments['source'] = '800UAEVAT'
        arguments['message'] = message

        success_list = []
        status = ''
        status = self.send_request(ss, arguments)

        if 200 <= status < 300:
            print "Success"
            self.add_comment('Comment', message)

    def send_request(self, gateway_url, params):
        import requests

        response = requests.get(gateway_url, params=params, headers={'Accept': "text/plain, text/html, */*"})
        response.raise_for_status()
        return response.status_code

    def createVFPlog(self):
        pre_stage = ""
        owner = frappe.session.user
        agent = getUserInfo(owner)

        # vfplog = frappe.get_list("VFP Log", fields="*", filters=[["vfp_account", "=", self.name], ["time_out", '=', '']], order_by='name desc', limit=1)
        vfplog = frappe.get_list("VFP Log", fields="*", filters={"vfp_account": self.name}, order_by='name desc', limit=1, ignore_permissions=True)

        if len(vfplog) > 0:
            pre_stage = vfplog[0].current_stage
            timeout = datetime.strptime(now()[:19], '%Y-%m-%d %H:%M:%S')
            timeout = timeout
            tat = str(self.tat)
            flag = self.flag

            frappe.db.set_value("VFP Log", vfplog[0].name, 'time_out', timeout)
            frappe.db.set_value("VFP Log", vfplog[0].name, 'tat', tat)
            frappe.db.set_value("VFP Log", vfplog[0].name, 'flag', flag)

        doc = frappe.new_doc("VFP Log")
        doc.vfp_account = self.name
        timein = datetime.strptime(now()[:19], '%Y-%m-%d %H:%M:%S')
        doc.time_in = timein
        doc.flag = 'Green'
        if pre_stage is not None and pre_stage != '':
            doc.previous_stage = pre_stage
        doc.current_stage = self.workflow_state
        if len(agent) > 0:
            doc.agent_id = agent[0].name
            doc.agent_name = agent[0].team_management_name
        doc.save(ignore_permissions=True)


# @frappe.whitelist()
# def currentvps(doc):
#     now = datetime.now().date()
#     filingdate = False
#     curr_filing = frappe.get_doc("VAT Filling Process", doc)
#     for schedule in curr_filing.vatschedule:
#         if schedule.vatsubmissiondate == datetime.strptime("2018-03-31", '%Y-%m-%d').date():
#             filingdate = True
#             break
#     if filingdate:
#         curr_filing.date_vat_filing = datetime.strptime("2018-03-31", '%Y-%m-%d').date()
#     curr_filing.save()

@frappe.whitelist()
def vps():
    now = datetime.now().date()
    filingdate = False
    filinglist = frappe.get_list("VAT Filling Process", filters=[["vps_account", "!=", ""]])
    for filing in filinglist:
        curr_filing = frappe.get_doc("VAT Filling Process", filing.name)
        for schedule in curr_filing.vatschedule:
            if schedule.vatsubmissiondate == now:
                filingdate = True
                break
        if filingdate:
            curr_filing.date_vat_filing = now
        curr_filing.save()

# @frappe.whitelist()
# def vpsBackDateRestriction():
#     vatlist = frappe.db.sql("""SELECT
#                                     business_id,
#                                     max( vat_filling_date ) file_date
#                                 FROM
#                                     `tabVAT Filling Process`
#                                 GROUP BY
#                                     business_id""")
#     for vat in vatlist:
        # vatdoc = frappe.get_doc("VAT Filling Process",vat[0])
        # vatdoc.backDateRestriction()

@frappe.whitelist()
def getRM(doctype=None, txt=None, searchfield=None, start=None, page_len=None, filters=None):
    rm = frappe.db.sql("""SELECT
                            tm.`name`,tm.`team_management_name` AS `value`
                        FROM
                            `tabTeam Management` tm
                            INNER JOIN `tabHas Role` hr ON hr.parent = tm.user_id 
                        WHERE
                            hr.role = 'Relationship Manager'""")
    return rm

@frappe.whitelist()
def getProcessor(doctype=None, txt=None, searchfield=None, start=None, page_len=None, filters=None):
    pr = frappe.db.sql("""SELECT
                            tm.`name`,tm.`team_management_name` AS `value`
                        FROM
                            `tabTeam Management` tm
                            INNER JOIN `tabHas Role` hr ON hr.parent = tm.user_id 
                        WHERE
                            hr.role = 'BackOffice Processing'""")
    return pr


@frappe.whitelist()
def getCSR(doctype=None, txt=None, searchfield=None, start=None, page_len=None, filters=None):
    csr = frappe.db.sql("""SELECT
                            tm.`name`,tm.`team_management_name` AS `value`
                        FROM
                            `tabTeam Management` tm
                            INNER JOIN `tabHas Role` hr ON hr.parent = tm.user_id 
                        WHERE
                            hr.role = 'Customer Support - Tax'""")
    return csr

@frappe.whitelist()
def providePermissions():
    oldusers = frappe.db.sql("""SELECT DISTINCT
                                    a.agentid,
                                    tm.user_id
                                FROM
                                    (
                                    SELECT
                                        rmid agentid
                                    FROM
                                        `tabVAT Filling Process`
                                    WHERE
                                        rmid IS NOT NULL UNION
                                    SELECT
                                        processorid agentid
                                    FROM
                                        `tabVAT Filling Process`
                                    WHERE
                                        processorid IS NOT NULL UNION
                                    SELECT
                                        csrid agentid
                                    FROM
                                        `tabVAT Filling Process`
                                    WHERE
                                        csrid IS NOT NULL
                                    ) a
                                    INNER JOIN `tabTeam Management` tm ON a.agentid = tm.NAME
                                WHERE
                                    agentid <> ''
                                ORDER BY
                                    1
                                """)

    for curruser in oldusers:
        frappe.db.sql("""delete
                    from tabDefaultValue
                    where parent not in ('__default', '__global')
                    and substr(defkey,1,1)!='_'
                    and parenttype='User Permission'
                    and defkey like 'VAT Filling Process'
                    and parent like %s
                    order by parent, defkey  """, curruser[1]);


    newusers = frappe.db.sql("""SELECT DISTINCT
                                    a.agentid,
                                    tm.user_id,
                                    vfp.NAME
                                FROM
                                    (
                                    SELECT
                                        rmid agentid
                                    FROM
                                        `tabVAT Filling Process`
                                    WHERE
                                        rmid IS NOT NULL UNION
                                    SELECT
                                        processorid agentid
                                    FROM
                                        `tabVAT Filling Process`
                                    WHERE
                                        processorid IS NOT NULL UNION
                                    SELECT
                                        csrid agentid
                                    FROM
                                        `tabVAT Filling Process`
                                    WHERE
                                        csrid IS NOT NULL
                                    ) a
                                    INNER JOIN `tabTeam Management` tm ON a.agentid = tm.
                                    NAME INNER JOIN `tabVAT Filling Process` vfp ON ( a.agentid = rmid OR a.agentid = vfp.csrid OR a.agentid = vfp.processorid )
                                WHERE
                                    agentid <> ''
                                ORDER BY
                                    3,1;""")
    for curruser in newusers:
        frappe.permissions.add_user_permission("VAT Filling Process", curruser[2], curruser[1])

@frappe.whitelist()
def getRefundClaim(doc,refund_claim_amount):
    refund = frappe.db.sql("""UPDATE `tabVAT Filling Process`
                                SET `docstatus` = 0,
                                 `workflow_state` = 'Refund Claim Processed',
                                 `currentstage` = 'Refund Claim Processed',
                                 `cur_wf_date` = now(),
                                  `refund_claim_amount` = '%s'
                                WHERE
                                    `name` = '%s' """ % (refund_claim_amount, doc))
    return refund

@frappe.whitelist()
def generatePermissions(vfpData):
    try:
        vfp = frappe.get_doc('VAT Filling Process', vfpData)
        frappe.permissions.remove_users_permission_from_doctype('VAT Filling Process', vfp.name)
        if vfp.agent:
            set_permission(vfp.agent, vfp.name)
        if vfp.teamleaderid:
            set_permission(vfp.teamleaderid, vfp.name)
        if vfp.salesmanagerid:
            set_permission(vfp.salesmanagerid, vfp.name)
        if vfp.ctm_link:
            set_permission(vfp.ctm_link, vfp.name)
        # if vfp.kam_link:
        #     set_permission(vfp.kam_link, vfp.name)
        if vfp.rmid:
            set_permission(vfp.rmid, vfp.name)
        # if vfp.processorid:
        #     set_permission(vfp.processorid, vfp.name)
        # if vfp.csrid:
        #     set_permission(vfp.csrid, vfp.name)
        if vfp.sr_auditorid:
            set_permission(vfp.sr_auditorid, vfp.name)
        if vfp.deo_indoor:
            set_permission(vfp.deo_indoor, vfp.name)
        if vfp.deo_outdoor:
            set_permission(vfp.deo_outdoor, vfp.name)
        print vfp.name
    except Exception as ex:
        print ex

def set_permission(user, vfp):
    curr_agent = frappe.get_doc("Team Management", user)
    if curr_agent.user_id is not None and curr_agent.user_id != '':
        frappe.permissions.add_user_permission("VAT Filling Process", vfp, curr_agent.user_id)

@frappe.whitelist()
def openRecord(vfpData):
    vfpdoc = frappe.db.sql("""UPDATE `tabVAT Filling Process`
                                SET `docstatus` = 0,
                                 `workflow_state` = 'Submit Filing in FTA',
                                 `currentstage` = 'Submit Filing in FTA',
                                 `cur_wf_date` = now()
                                WHERE
                                    `name` = '%s' """ % vfpData)

    doc = frappe.get_doc("VAT Filling Process", vfpData)
    if doc.vps_account != '' and doc.vps_account != None:
        date_vat = datetime.strptime(str(doc.vat_filling_date), '%Y-%m-%d').date()
        frappe.db.sql(
            """update `tabVat Submission Schedule` set `vatsubmitted` = 0 where parent = '%s' and vatsubmissiondate = '%s'""" % (
                doc.name, date_vat))

        # orgdoc = frappe.get_doc("Organization", doc.business_id)
        frappe.db.sql(
            """update `tabVat Submission Schedule` set `vatsubmitted` = 0 where parent = '%s' and vatsubmissiondate = '%s'""" % (
                doc.business_id, date_vat))

        ftadoc = frappe.get_list("FTA Registration Process", filters={"organizationid": doc.business_id})
        if len(ftadoc) > 0:
            frappe.db.sql(
                """ update `tabVat Submission Schedule` set `vatsubmitted` = 0 where parent = '%s' and vatsubmissiondate = '%s'""" % (
                    ftadoc[0].name, date_vat))

        # vatdoc = frappe.get_list("VAT Processing System", filters={"organizationid": doc.business_id})
        # if len(vatdoc) > 0:
        frappe.db.sql(
            """ update `tabVat Submission Schedule` set `vatsubmitted` = 0 where parent = '%s' and vatsubmissiondate = '%s'""" % (
                doc.vps_account, date_vat))
    doc.add_comment('Comment', "Record opened")
    frappe.db.commit()
    return vfpdoc

@frappe.whitelist()
def getChildOrg(parentOrg):

    org = frappe.db.sql("""SELECT
                            concat(org. NAME, '-', org.business_name) AS org,
                            concat(
                                porg. NAME,
                                '-',
                                porg.business_name
                            ) AS porg,
                            vps. NAME AS vps,
                            pvps. NAME AS pvps
                        FROM
                            tabOrganization org
                        INNER JOIN tabOrganization porg ON org.`parentorg` = porg.`name`
                        INNER JOIN `tabVAT Processing System` vps ON org.`name` = vps.`organizationid`
                        INNER JOIN `tabVAT Processing System` pvps ON porg.`name` = pvps.`organizationid`
                        WHERE pvps.currentstage not in ('Cancelled - Not Signed','Cancelled - Signed') AND org.`parentorg` = '%s'"""% parentOrg, as_dict=1)
    return org

@frappe.whitelist()
def getAllVPS(vpsData):
    vps = frappe.db.sql("""SELECT
                            vps. NAME AS vps,
                            pvps. NAME AS pvps
                        FROM
                            tabOrganization org
                        INNER JOIN tabOrganization porg ON org.`parentorg` = porg.`name`
                        INNER JOIN `tabVAT Processing System` vps ON org.`name` = vps.`organizationid`
                        INNER JOIN `tabVAT Processing System` pvps ON porg.`name` = pvps.`organizationid`
                        WHERE pvps.currentstage not like ('Cancelled - Not Signed','Cancelled - Signed') AND org.`parentorg` = '%s'"""% vpsData, as_dict=1)
    return vps

@frappe.whitelist()
def customerFeedback(vfpData, status=None):
    vfpdoc = frappe.db.sql("""UPDATE `tabVAT Filling Process`
                                    SET `docstatus` = %s
                                    WHERE
                                        `name` = '%s' """ % (status, vfpData))

    doc = frappe.get_doc("VAT Filling Process", vfpData)

    vfpdoc = frappe.db.sql("""update `tabOfficial Documents`
            set docstatus = 1
            where parent like '%s' """ % (vfpData))

    doc = frappe.get_doc("VAT Filling Process", vfpData)
    doc.add_comment('Comment', "Customer Feedback updated")
    frappe.db.commit()

@frappe.whitelist()
def clientFeedbackPostFiling(vfpData,documentName):
    vfpdoc = frappe.db.sql("""UPDATE `tabVAT Filling Process`
                                    SET `docstatus` = 0
                                    WHERE
                                        `name` = '%s' """ % (vfpData))

    doc = frappe.get_doc("VAT Filling Process", vfpData)
    doc.add_comment('Comment', "Customer Feedback updated")
    frappe.db.commit()

    docname = frappe.db.sql("""SELECT * FROM `tabDocument Type` WHERE document_name = '%s'""" % documentName)
    return docname

@frappe.whitelist()
def cancelAccount(vfpData):
    vfpdoc = frappe.db.sql("""UPDATE `tabVAT Filling Process`
                                SET `docstatus` = 2,
                                 `workflow_state` = 'VFP Cancelled',
                                 `currentstage` = 'VFP Cancelled',
                                 `cur_wf_date` = now()
                                WHERE
                                    `name` = '%s' """ % vfpData)

    doc = frappe.get_doc("VAT Filling Process", vfpData)
    if doc.vps_account != '' and doc.vps_account != None:
        date_vat = datetime.strptime(str(doc.vat_filling_date), '%Y-%m-%d').date()
        frappe.db.sql(
            """update `tabVat Submission Schedule` set `vatfile` = 0, `vatsubmitted` = 0 where parent = '%s' and vatsubmissiondate = '%s'""" % (
                doc.name, date_vat))

        frappe.db.sql(
            """update `tabVat Submission Schedule` set `vatfile` = 0, `vatsubmitted` = 0 where parent = '%s' and vatsubmissiondate = '%s'""" % (
                doc.business_id, date_vat))

        ftadoc = frappe.get_list("FTA Registration Process", filters={"organizationid": doc.business_id})
        if len(ftadoc) > 0:
            frappe.db.sql(
                """ update `tabVat Submission Schedule` set `vatfile` = 0, `vatsubmitted` = 0 where parent = '%s' and vatsubmissiondate = '%s'""" % (
                    ftadoc[0].name, date_vat))

        # vatdoc = frappe.get_list("VAT Processing System", filters={"organizationid": doc.business_id})
        # if len(vatdoc) > 0:
        frappe.db.sql(
            """ update `tabVat Submission Schedule` set `vatfile` = 0, `vatsubmitted` = 0 where parent = '%s' and vatsubmissiondate = '%s'""" % (
                doc.vps_account, date_vat))
    doc.add_comment('Comment', "Cancel Account")
    frappe.db.commit()
    return vfpdoc

@frappe.whitelist()
def getUserInfo(userid):
    agent = frappe.db.sql("""SELECT `name`, team_management_name, `resource_type` FROM `tabTeam Management` WHERE user_id='%s'""" % userid, as_dict=True)
    return agent

@frappe.whitelist()
def calculateTAT(startDate):
    startDate = datetime.strptime(str(startDate[:19]), '%Y-%m-%d %H:%M:%S')

    if startDate is not None and startDate != '':
        cur_date = frappe.utils.now()
        now = datetime.strptime(cur_date[:19], '%Y-%m-%d %H:%M:%S')
        countDays = 0
        countFridays = 0

        diff = now - startDate
        days, seconds = diff.days, diff.seconds
        hours = days * 24 + seconds // 3600
        minutes = (seconds % 3600) // 60
        # seconds = seconds % 60

        # def daterange(start_date, end_date):
        #     for n in range(int((end_date - start_date).days)):
        #         yield start_date + timedelta(n)

        start_date = startDate
        end_date = now

        # for single_date in daterange(start_date, end_date):
        #     weekday = single_date.date().weekday()
        #
        #     countDays += 1
        #     if weekday == 4:
        #         countFridays = countFridays + 1

        countFridays = 0
        while start_date <= end_date:
            weekday = start_date.date().weekday()
            if weekday == 4:
                countFridays = countFridays + 1
            start_date = start_date + timedelta(1)

        totalfridayhours = countFridays * 24
        totalhours = hours - totalfridayhours

        if totalhours < 10:
            totalhours = '0' + str(totalhours)
        if minutes < 10:
            minutes = '0' + str(minutes)


        tat = str(totalhours) + ':' + str(minutes)
        return tat

@frappe.whitelist()
def deo_outdoor_endDate(vfpid):
    vfpdoc = frappe.get_doc("VAT Filling Process", vfpid)
    endDate = datetime.strptime(now()[:19], '%Y-%m-%d %H:%M:%S')
    vfpdoc.createVFPlog()

    return endDate

@frappe.whitelist()
def reminder_mail(vfpid):
    vfpdoc = frappe.get_doc("VAT Filling Process", vfpid)
    vfpdoc.vfp_reminder_mail()

@frappe.whitelist()
def non_responsive_client_mail(vfpid):
    vfpdoc = frappe.get_doc("VAT Filling Process", vfpid)
    vfpdoc.non_responsive_mail()
    

