const MOVE_AMOUNT = 100
const ROBOT_RADIUS = 50

function main(args){
    let actions = []
    let data = args.data
    data.move_direction = data.move_direction ? data.move_direction : "forwards"
    data.last_change_direction = data.last_change_direction ? data.last_change_direction : Date.now()  

    switch(args.event) {
        case "idle":
            
            let move_action = move(data.move_direction, MOVE_AMOUNT)

            if(isStart(data)){
               actions.push({"yell": "isStart!"}) 
               data.is_start = false
                             

               if(isCyan(args.x)){          
                    
                    let rotation = rotate(args.angle, 0)    

                    data.is_cyan = true     

                    actions.push({...tankAndTurretRotationTogether(rotation)})   
                         
                    
                }else{                    

                    data.is_red = true

                    let rotation = rotate(args.angle, 180)                     
                   
                    
                    actions.push({...tankAndTurretRotationTogether(rotation)})                         

                    
                } 

                let move_action = move(data.move_direction, MOVE_AMOUNT)
                
                actions.push(move_action)
                actions.push({...shoot()})
                
             

            }else{

                if(data.spotted === true){
                    //let my_next_position = myNextPosition(args.x, args.y, args.tank_angle, MOVE_AMOUNT,  data.move_direction)
                    //let enemy_next_position = enemyNextPosition(data.last_enemy_spot.x, data.last_enemy_spot.y, data.last_spotted_time, data.enemy_spot_history)                   
                    actions.push({...move(data.move_direction, MOVE_AMOUNT)})
                    let enemy_next_position = enemyNextPosition(data.last_enemy_spot.x, data.last_enemy_spot.y, data.last_spotted_time, data.enemy_spot_history)  
                    let angle = angleFromCoords(args.x, args.y, enemy_next_position.x,   enemy_next_position.y) 
                    let rotation = rotate(args.angle, angle)
                    actions.push({...turretRotation(rotation)})                    
                    if(hasToShoot(args.angle, angle, data.last_enemy_spot.distance))
                        actions.push({...shoot()})                                                                   
                    actions.push({...shoot()})
                    data.spotted = false
                }else if(data.last_enemy_spot != undefined && (Date.now() - data.last_spotted_time) < 10000){                    
                    //let my_next_position = myNextPosition(args.x, args.y, args.tank_angle, MOVE_AMOUNT,  data.move_direction)
                    //let enemy_next_position = enemyNextPosition(data.last_enemy_spot.x, data.last_enemy_spot.y, data.last_spotted_time, data.enemy_spot_history)
                    let angle = angleFromCoords(args.x, args.y, data.last_enemy_spot.x,  data.last_enemy_spot.y)
                    //let angle = angleFromCoords(args.x, args.y, data.last_enemy_spot.x, data.last_enemy_spot.y )
                    let rotation = rotate(args.angle, angle)
                    actions.push({...turretRotation(rotation)})           
                    actions.push({...move(data.move_direction, MOVE_AMOUNT)})                  
                }else{   
                    if(data.is_cyan)                
                        actions.push({"turn_left": 180, "turn_turret_left": 180})
                   
                    if(data.is_red)                
                        actions.push({"turn_right": 180, "turn_turret_right": 180})      
                }


            }            
            break;
        case "wall-collide":
            data.move_direction = changeDirection(data.move_direction)                            
            data.last_change_direction = Date.now()                          
            return {"body": [{"move_opposide": 50}, {"data":data}]}
        case "hit":
            if(Date.now() - data.last_change_direction > 3000){
                data.move_direction = changeDirection(data.move_direction)                            
                data.last_change_direction = Date.now()
            }
            break
        case "enemy-spot":
            let rotation = rotate(args.angle, args.enemy_spot.angle)            
            actions.push({...tankAndTurretRotationTogether(rotation)})
            
            data.last_enemy_spot = {} 
            data.last_enemy_spot = args.enemy_spot
            data.spotted = true
            data.last_spotted_time = Date.now()
            
            let history = {...args.enemy_spot, "time": Date.now()}
            history.time = data.last_spotted_time      

            if(data.enemy_spot_history == undefined)
                data.enemy_spot_history = []
            
            data.enemy_spot_history.push(history)   
            data.enemy_spot_history = data.enemy_spot_history.slice(Math.max(data.enemy_spot_history.length - 10, 0)) 


            break
        default:
            console.log(args)
    }  
    actions.push({"data": data} )  
    return { "body": actions}
}

function enemyNextPosition(last_x, last_y,last_time, enemy_spot_history){
    let result = {}
    result.x = last_x
    result.y = last_y

    if(!enemy_spot_history || enemy_spot_history.lenght < 2 || (Date.now() - last_time > 3000)){
       
        return result
    }
        

    let dt = []
    let dx =[]
    let dy = []
    for(var i = 0; i+1<= enemy_spot_history.length - 1 ;i++){
         dx[i] = enemy_spot_history[i+1].x - enemy_spot_history[i].x
         dy[i] = enemy_spot_history[i+1].y - enemy_spot_history[i].y
         dt[i] = enemy_spot_history[i+1].time - enemy_spot_history[i].time
    }

    let dvx = dx.map(function(n, i) { return n / dt[i]; });
    let dvy = dy.map(function(n, i) { return n / dt[i]; });

    

    let sum_dvx = dvx.reduce((a, b) => a + b, 0);
    let sum_dvy = dvy.reduce((a, b) => a + b, 0);   

    let advx = (sum_dvx / dvx.length) || 0;
    let advy = (sum_dvy / dvy.length) || 0;

       
    let now = Date.now()
     
    result.x = result.x + advx * (now - last_time)
    result.y =  result.y + advy * (now - last_time)  

    return result


}

function hasToShoot(angle,target_angle, distance){
    let beta = radians2degrees(Math.atan2(ROBOT_RADIUS, distance))
    return Math.abs(angle - target_angle) <= (2 * beta)
}

function myNextPosition(x,y, angle, move_amount, direction){    
    let result = {}

    console.log(x,y, angle, move_amount, direction)
    
    if(angle < 90){
       if(direction == 'forwards'){
           result.y = y - Math.sin(angle) * move_amount
           result.x = x + Math.cos(angle) * move_amount
       }else{
           result.y = y + Math.sin(angle) * move_amount
           result.x = x - Math.cos(angle) * move_amount
       }

    }else if(angle < 180){
       angle = angle % 90
       if(direction == 'forwards'){
           
          result.y = y - Math.cos(angle) * move_amount
          result.x = x - Math.sin(angle) * move_amount 

       }else{
          
          result.y = y + Math.cos(angle) * move_amount
          result.x = x + Math.sin(angle) * move_amount 

       }

    }else if(angle < 270){
        angle = angle % 180
       if(direction == 'forwards'){
          
          result.y = y + Math.sin(angle) * move_amount
          result.x = x - Math.cos(angle) * move_amount

       }else{
          
          result.y = y - Math.sin(angle) * move_amount
          result.x = x + Math.cos(angle) * move_amount

       }
    }else{
       angle = angle % 270
       if(direction == 'forwards'){
           
          result.y = y + Math.cos(angle) * move_amount
          result.x = x + Math.sin(angle) * move_amount 

       }else{
          
          result.y = y - Math.cos(angle) * move_amount
          result.x = x - Math.sin(angle) * move_amount 

       }

    } 

    console.log(result)

    return result

}

function tankAndTurretRotationTogether(rotation){
    let action = {}
    action.yell = rotation.yell
    let turret_rotation = turretRotation({...rotation, "angle": rotation.angle / 2})
    let tank_rotation = tankRotation({...rotation, "angle": rotation.angle / 2})
    action = {...action, ...tank_rotation, ...turret_rotation, }
    return action
}

function tankAndTurretRotation(rotation){
    let action = {}
    action.yell = rotation.yell
    let turret_rotation = turretRotation(rotation)
    let tank_rotation = tankRotation(rotation)
    action = {...action, ...turret_rotation, ...tank_rotation}
    return action
}

function turretRotation(rotation){
    let result = {}    
    let turret_rotation = "turn_turret_"+rotation.direction   
    result[turret_rotation] = rotation.angle    
    return result     
}

function move(direction, amount){
    let action = {}
    action["move_"+direction] = amount
    return action
}

function tankRotation(rotation){
    let result = {}    
    let tank_rotation = "turn_"+rotation.direction   
    result[tank_rotation] = rotation.angle    
    return result     
}

function changeDirection(move_direction){
    return move_direction === "forwards" ? "backwards" : "forwards"
}

function shoot(){
    return {"shoot": true}
}

function rotate(from, to){
    let delta = Math.abs(to - from)
    let result = {"direction": "right", "angle": 0}
    if(to < from){
        if(delta > 180){
            result = {"direction" : "right", "angle": 360 - delta}                         
        }else{   
            result = {"direction" : "left", "angle": delta}                                 
        }                                             
    }else if(to > from){
        if(delta > 180){
            result = {"direction" : "left", "angle": 360 - delta}           
        }else{   
            result = {"direction": "right", "angle": delta}
        }                                        
    }   
    let yell = "from " + from + " to:" + to + " "+result.direction+" "+result.angle
    result.yell = yell
    return result;
}

function invertRotation(rotation){
    return {...rotation, "direction": rotation.direction == "left" ? "right" : "left" }
}

function angleFromCoords(x1,y1,x2,y2){    
    let angle = radians2degrees(Math.atan2(y2-y1,x2-x1))
    if(angle < 0){
        angle = 360 + angle
    }
    return angle
}

function radians2degrees(radians) {
    return radians * (180 / Math.PI);
}

function euclidDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

function degrees2radians(degrees) {
    return degrees * (Math.PI / 180);
}

function isStart(data){
    return Object.keys(data).length === 0 || ! ("is_start" in data) || data["is_start"] === true 
}

function isCyan(x){
    return x < 250
}

function isRed(x){
    return x > 250
}
