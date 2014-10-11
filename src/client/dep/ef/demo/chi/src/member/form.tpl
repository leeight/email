<!-- target: memberForm -->
<div id="crumb-container">
    <div data-ui-type="Crumb" data-ui-id="formCrumb" data-ui-path="@crumbPath"></div>
</div>
<form class="edit-form" data-ui-type="Form" data-ui-id="form" data-ui-submit-button="submitButton">
    <div class="form-body">
        <div class="form-row">
            <div class="form-key">姓名：</div>
            <div class="form-value">
                <input data-ui-type="TextBox" data-ui-id="name" data-ui-name="name" data-ui-mode="text" data-ui-value="${detail.name}"/>
            </div>
        </div>
        <div class="form-row">
            <div class="form-key">性别：</div>
            <div class="form-value">
                <div data-ui-type="BoxGroup" data-ui-name="gender" data-ui-id="gender" data-ui-box-type="radio" data-ui-value="${detail.gender}">
                    <ul>
                        <li>
                            <input type="radio" value="1" title="${Gender.1}" name="gender"/>
                        </li>
                        <li>
                            <input type="radio" value="0" title="${Gender.0}" name="gender"/>
                        </li>
                        <li>
                            <input type="radio" value="2" title="${Gender.2}" name="gender"/>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="form-row">
            <div class="form-key">生日：</div>
            <div class="form-value">
                <div data-ui-type="Calendar" data-ui-id="birthday"
                 data-ui-name="birthday" data-ui-value="@detail.birthday"
                 data-ui-range="1970-01-01,2000-12-31"></div>
            </div>
        </div>
    </div>
    <div class="submit-row">
        <div class="form-row">
            <div class="form-value">
                <div data-ui-type="Button" data-ui-id="submitButton" data-ui-skin="spring">
                    <!-- if: ${formType} == 'update' -->
                        新建
                    <!-- else -->
                        保存
                    <!-- /if -->
                </div>
                <div data-ui-type="Button" data-ui-id="cancelButton">取消</div>
            </div>
        </div>
    </div>
</form>