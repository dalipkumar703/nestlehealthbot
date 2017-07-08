var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

module.exports =mongoose.model('MealPlan',
               new Schema({   user_id:String,
                 calorie_range: String,
                 eating_choice:String

               }),
               'meal_plan');
