<!-- target: affairForm -->
<form class="edit-form"
data-ui-type="Form" data-ui-id="form" data-ui-submit-button="submit-button">
	<div class="form-body">
        <!-- if: ${formType} == 'update' -->
	    <div class="form-row">
	        <div class="form-key">当前余额：</div>
	        <div class="form-value">
	        	<label data-ui-type="Label"
	        	data-ui-id="balance" data-ui-text="@detail.balance"></label>
	        </div>
	    </div>
        <!-- /if -->
	    <div class="form-row">
	        <div class="form-key">啥时候：</div>
	        <div class="form-value">
	        	<div data-ui-type="Calendar" data-ui-id="time"
	        	 data-ui-name="time" data-ui-value="${detail.time}"></div>
	        </div>
	    </div>
	    <div class="form-row">
	        <div class="form-key">谁：</div>
	        <div class="form-value">
            	<div data-ui-type="Select" data-ui-id="member"
            	 data-ui-name="member" data-ui-datasource="@members"
            	 data-ui-value="@detail.member.id"></div>
	        </div>
	    </div>
	    <div class="form-row">
	        <div class="form-key">充值\支出：</div>
	        <div class="form-value">
            	<div data-ui-type="Select" data-ui-id="type"
            	 data-ui-name="type" data-ui-datasource="@types"
            	 data-ui-value="@detail.type"></div>
	        </div>
	    </div>
	    <div class="form-row">
	        <div class="form-key">金额：</div>
	        <div class="form-value">
                <input data-ui-type="TextBox" data-ui-id="amount"
                 data-ui-name="amount" data-ui-mode="text"
                 data-ui-title="金额" 
                 data-ui-required="required"
                 data-ui-pattern="/^[0-9]\d*(\.\d+)?$/"
                 data-ui-patternErrorMessage="金额必须为整数"
                 data-ui-value="@detail.amount" />
	        </div>
	    </div>
	    <div class="form-row">
	        <div class="form-key">备注：</div>
	        <div class="form-value">
                <textarea data-ui-type="TextBox" data-ui-id="memo"
                 data-ui-name="memo" data-ui-mode="textarea"
                 data-ui-value=""></textarea>
	        </div>
	    </div>
	</div>
	<div class="submit-row">
	    <div class="form-row">
	        <div class="form-value">
	            <div data-ui-type="Button" data-ui-id="submit-button"
	             data-ui-skin="spring">保存并继续</div>
	            <div data-ui-type="Button"
	             data-ui-skin="link" data-ui-id="cancel-button">取消新建</div>
	        </div>
	    </div>
	</div>
</form>