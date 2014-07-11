/*PathNode.js
 * path object
 * extends GeometryNode
 * node with actual path in it
 */


define([
  'underscore',
  'models/data/GeometryNode',
  'models/PaperManager'

], function(_, GeometryNode, PaperManager) {
  //drawable paper.js path object that is stored in the pathnode

  var PathNode = GeometryNode.extend({

    type: 'path',


    constructor: function() {
      this.path_literal = null;
      GeometryNode.apply(this, arguments);
      //console.log('number of nodes='+SceneNode.numNodeInstances);
    },

    //mixin: Utils.nodeMixin,

    initialize: function() {

      //intialize array to store instances

      var paper = PaperManager.getPaperInstance();
      this.path_literal = new paper.Path();
      this.path_literal.selected = true;
      this.path_literal.strokeColor = 'black';
      this.path_literal.data.nodeParent = this;
      
    
    },

    /*called when drawing of the path is complete. 
    * Removes the path and creates one instance
    * in original path location
    */
    pathComplete: function(){
      this.render([{position:{x:0,y:0},scale:1,rotation:0}]);  
      this.path_literal.remove();

    },
  
   update: function(data){
          console.log("path update");
          this.position.x =data.position.x;
          this.position.y =data.position.y;
          this.scale = data.scale;
          this.rotation = data.rotation;
          console.log(this.position);

    },

    /* renders instances of the original path
    * render data contains an array of objects containing
    * poition, scale and rotation data for each instance
    */
    render: function(render_data){
      
      if(this.instances.length>0){
        this.path_literal= this.instances[0];
    }
    for(var j=1;j<this.instances.length;j++){
      this.instances[j].remove();
    }
     this.instances = [];
      for(var i=0;i<render_data.length;i++){
          var instance = this.path_literal.clone();
          instance.data.nodeParent= this;
          instance.position.x+= render_data[i].position.x;
          instance.position.y+= render_data[i].position.y;
       

          instance.position.x+=this.position.x;
          instance.position.y+=this.position.y;
          
         instance.scale(render_data[i].scale);
         instance.rotate(render_data[i].rotation);
        this.instances.push(instance);
        console.log('path render');

       }
       this.path_literal.remove();
        var paper = PaperManager.getPaperInstance();
       console.log('num of drawn children='+paper.project.activeLayer.children.length);
    },

    //selects or deselects all path instances
    selectAll: function(isSelect){
      console.log('calling path select all'+ isSelect);
      for(var i =0;i<this.instances.length;i++){
        if(isSelect){
          this.instances[i].selected= true;
        }
        else{
          this.instances[i].selected = false;
        }
      }

    },


    //update triggers change event in mouseup
    mouseUpInstance: function() {

      this.trigger('change:mouseUp', this);

    },


  });

  return PathNode;

});