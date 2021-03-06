module.exports.validateEmail = (email) => {

    if (!email|| !email.match(
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        )){
            return 'Enter a valid email address';
    }
    return false;
};

module.exports.validateFullName = (fullName) => {
    if (!fullName){
        return 'Enter a valid name.'
    }
    return false;
};

module.exports.validateUsername = (username)=> {
    if(!username){
        return 'Enter a validate username.'
    } else if (username.length > 30 || username.length < 3) {
        return 'Select a username between 3 and 30 characters.';
    } else if (!username.match(/^[a-zA-Z0-9\_.]+$/)){
        return 'A username can only contain the following: letters from A-Z, numbers 0-9, and the symbols _ .';
    }
    return false;    
};

module.exports.validatePassword = (password) => {
    if(!password){
        return 'Enter a valid password.';
    }else if ( password.length < 6){
        return 'Passwords much be at least six characters.'
    }else if (!password.match(/^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9])(?=.*[a-z]).{6,}$/)){
        return 'A password needs to have at least one uppercase letter, one lowercase letter, one special character and one number.';
    }
    return false;
};