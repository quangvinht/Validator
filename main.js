//DỐi tuong975 validator:
function Validator (options) {

    //Trường hợp thẻ input nằm trong nhiều thẻ khác nên ko thẻ lấy ra thể form group dc:
    function getParent(element,selector) {
            while (element.parentElement){
                if( element.parentElement.matches(selector) ){//Kiểm tra thằng cha có selector ko ko có thì lặp ra ngoài tiếp
                    return element.parentElement
                }
                else{
                    element = element.parentElement
                }

            }
    }


    var selectorRules = {}


    function validate(inputElement,rule) {//hàm thực hiện validate 
               
                    
                    var errorMessage //thông báo lỗi

                    //từ inputelemnt nghĩa là từ ô input tìm ra thẻ cha của nó qua parentElement rồi sau đó tìm tới form-message
                    //của thằng input đó (dùng document.quereySelector thì sẽ ko biết form-message của ô input nào)
                    var errorElement = getParent(inputElement,options.formGroupSelector).querySelector(options.errorSelector)
                    

                    //Lấy ra các rule của selector
                   var rules = selectorRules[rule.selector]

                    //Lặp qua từng rule và kiểm tra nếu có lỗi thì dừng kiểm tra
                    for (var i = 0; i < rules.length; i++) {
                        //trường hợp thẻ input là radio hay check box gì dó:
                        switch (inputElement.type){
                            case 'checkbox':                              
                            case'radio'  :
                                errorMessage = rules[i](
                                    formElement.querySelector(rule.selector+':checked')
                                )
                                break

                            //Trường hợp là thẻ input bình thường
                            default:
                                errorMessage = rules[i](inputElement.value)
                        }


                       
                       if (errorMessage) {
                           break
                       }
                    }

                    
                    

                    if (errorMessage){ // nếu có lỗi: thì hiển thị form-message
                            errorElement.innerText = errorMessage // hiển thị thông báo lỗi
                            getParent(inputElement,options.formGroupSelector).classList.add('invalid')//thêm hiệu ứng báo lỗi
                    }else {
                        errorElement.innerText = ''
                        getParent(inputElement,options.formGroupSelector).classList.remove('invalid')
                    }
                    return !errorMessage//nếu có erormessage thì trả về true ngược lại false

    }
    //Lấy element của form cần validate:
    var formElement = document.querySelector(options.form)
     

    if(formElement){

        //Khi submit form thì bỏ cái sự kiện mặc định ở đây là submit
        formElement.onsubmit = function (e){

            e.preventDefault()

            var isFormInvalid = true

            //Lặp qua từng rule và validate:
            options.rules.forEach  ( (rule) => {
                var inputElement = formElement.querySelector(rule.selector)
                
                
                var isValid = validate(inputElement, rule)
                if (!isValid) {
                    isFormInvalid = false
                }
                

            })

            
            
            

            

            
            if(isFormInvalid){
                
                //Trường hợp submit với javascript
                if(typeof options.onSubmit === 'function'){

                    //Lấy ra các ô input có name để trành bị trùng các thẻ khác
                    var enableInputs = formElement.querySelectorAll('[name]:not([disabled])')
                    var formValues = Array.from(enableInputs).reduce( function(values,input){
                        
                        switch(input.type){
                            case 'radio':
                                values[input.name] = formElement.querySelector('input[name="'+input.name+'"]:checked').value                              
                                break
                            case 'checkbox':
                                if(!input.matches(':checked')) {
                                    values[input.name] = ''
                                    return values
                                }
                                    
                                
                                    
                                if (!Array.isArray(values[input.name]) ){
                                    values[input.name] = []
                                }
                                    
                                values[input.name].push(input.value)
                                
                                break
                            case 'file':
                                values[input.name]=input.files
                                break

                            default:
                                    values[input.name] = input.value
                        }

                        
                        return  values 
                    },{} )
                    //trả về các value của ô input:
                    options.onSubmit(formValues)
                    
                }
                

            }
            //Trường hợp submit với hành vị mặc định: nghĩa là nếu ko có thằng onSubmit thì chạy bt có hiện lỗi 
            else{
                formElement.submit()
            }

        }

        
        //Xử lý lặp qua mỗi rule vá xử lý (lắng nghe sự kiện blur hay input)
        options.rules.forEach  ( (rule) => {

            //Lưu lại các rule của mỗi ô input:
            if (Array.isArray(selectorRules[rule.selector]) )  {
                selectorRules[rule.selector].push(rule.test)
            }else{
                selectorRules[rule.selector] = [rule.test]
            }
            

            var inputElements = formElement.querySelectorAll(rule.selector)//trả về Nodelist

            Array.from(inputElements).forEach( (inputElement) => {

                 //XỬ lý trường hợp blur khỏi ô input
                 inputElement.onblur = () => { // bắt sự kiện blur

                    validate(inputElement,rule)
                    

                }

                //XỬ lý mỗi khi người dùng nhập vào input thì tắt hiển thị lỗi:
                inputElement.oninput = ()=>{

                    var errorMessage = rule.test(inputElement.value)
                    var errorElement = getParent(inputElement,options.formGroupSelector).querySelector(options.errorSelector)

                    errorElement.innerText = ''
                    getParent(inputElement,options.formGroupSelector).classList.remove('invalid')
                }

                inputElement.onchange = ()=>{

                    var errorMessage = rule.test(inputElement.value)
                    var errorElement = getParent(inputElement,options.formGroupSelector).querySelector(options.errorSelector)

                    errorElement.innerText = ''
                    getParent(inputElement,options.formGroupSelector).classList.remove('invalid')
                }

            })

            
        })

    }
    


}






//ĐỊnh nghĩa các rules:
//Nguyên tắc của các rules:
//1.Khi có lỗi trả về message lỗi
//2.Khi hợp lệ ko trả ra gì cả
Validator.isRequired = function (selector,message){ //bắt buộc nhập ko nhập là lỗi

    return {
        selector,//viết theo kiểu ES6
        test: function (value) {
            return value ? undefined :  message || 'Vui lòng nhập trường này'// toán tử 3 ngôi
            //Nhập vào thì trả về undefined còn ko nhập trả vè message lỗi vàtrim để loại bỏ space
        }
    }

}

Validator.isEmail = function (selector,message){ // kiểm tra xem nhập có phải dạng emial không
   
    return {
        selector,//viết theo kiểu ES6
        test: function (value) {
            var regex =  /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/ // chuổi kiểm tra có phải email không
            return regex.test(value) ? undefined :  message ||'Trường này phải là email'
            
        }
    }
}

Validator.isPassword = function (selector,number,message){ // kiểm tra xem nhập password có đúng điều kiện của 1 cái mk hay không?
  
    return {
        
        selector,//viết theo kiểu ES6
        test: function (value, min = number, mess =  message ) {
            
        
            var regex =  /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/  // chuổi kiểm tra cdk của password
           if(value.length < min){
            return  mess  || `Password phải có độ dài lớn hơn ${min}`
                 

           } else if (!/\d/.test(value)){
                    return mess  || 'Password nên chứa ít nhất một chữ số'
            }
            else if (!/[a-z]/.test(value)){
                    return mess  || 'Password nên chứa ít nhất một chữ thường'
                }
                else if (!/[A-Z]/.test(value)){
                    return mess  || 'Password nên chứa ít nhất một chữ hoa'
        }
            
            
           
           
         
           
           
           
        }
    }
}

Validator.isconFirmed = function(selector,getConfirmValue,message) { //Xử lý đối với password confirmed
    return {
        selector,//viết theo kiểu ES6
        test: function (value) {
            return value === getConfirmValue() ? undefined : message || 'Giá trị nhập vào không chính xác'
        }
    }
}

