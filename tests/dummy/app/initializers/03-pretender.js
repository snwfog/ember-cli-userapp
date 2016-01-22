import Pretender from 'pretender';

export function initialize(/* application */) {
  let server = new Pretender();
  server.register('OPTIONS', 'https://api.userapp.io/v1/*', function() {
    return [200, { "Content-Type": "application/json" }, ""];
  });

  server.post('https://api.userapp.io/v1/user.login', function(request) {
    return [
      200,
      { "Content-Type": "application/json" },
      JSON.stringify({
        "token":     "random_token",
        "user_id":   "random_user_id",
        "lock_type": "",
        "locks":     [],
      })
    ];
  });

  let mockUser = [{
    "user_id":        "random_user_id",
    "first_name":     "Test_User_First_Name",
    "last_name":      "Test_User_Last_Name",
    "email":          "test@userapp.io",
    "email_verified": false,
    "login":          "test@userapp.io",
    "properties":     {},
    "features":       {},
    "permissions":    {},
    "subscription":   null,
    "lock":           null,
    "locks":          [],
    "ip_address":     null,
    "last_login_at":  1453173581,
    "updated_at":     1453173581,
    "created_at":     1453135148
  }];

  server.post('https://api.userapp.io/v1/user.get', function(request) {
    return [
      200,
      { "Content-Type": "application/json" },
      JSON.stringify(mockUser),
    ];
  });
}

export default {
  name: '03-pretender',
        initialize
};
