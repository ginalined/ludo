//class for movement

// User defined class node 
class Node { 
    // constructor 
    constructor(position, color,spin,big_jump) 
    { 
        this.position = position; 
        this.next = null;
        this.color = color;
        this.spin = spin;
        this.big_jump = big_jump;

    } 
} 

// linkedlist class 
class LinkedList 
{ 
    constructor() 
    { 
        this.head = null; 
        this.current = null; 
        this.size = 0;
    } 
  
// adds an element at the end 
// of list 
    add(position,color = false,spin = 0, big_jump = false) 
    { 
        // creates a new node 
        var node = new Node(position,color, spin, big_jump); 
  
        // to store current node 
        var current; 
  
        // if list is Empty add the 
        // element and make it head 
        if (this.head == null) 
        {
            this.head = node;
        }
        else 
        { 
            current = this.head; 
            
        // iterate to the end of the 
        // list 
        while (current.next != null) 
        { 
            current = current.next; 
        } 
  
        // add node 
        current.next = node; 
        } 
        this.size++; 
    } 

    move_to_next()
    {
        if(this.current.next.next!= null)
            {
                this.current = this.current.next;
                return true;
            }
        else
            return false;   
    }

} 

class plane
{
    constructor(plane_model_transform, color, plane_model_rotate = Mat4.identity(),number_from_dice = 0)
    {
       this.plane_model_rotate = plane_model_rotate;
       this.plane_model_transform = plane_model_transform; 
       this.plane_start_location = plane_model_transform;
       this.jumped = false; 
       this.number_from_dice = number_from_dice;
       this.color = color;
       this.if_start = false;
       this.if_shine = false; 
       this.destination = false; 
    }


}





window.Assignment_Three_Scene = window.classes.Assignment_Three_Scene =
class Assignment_Three_Scene extends Scene_Component
  { constructor( context, control_box )     // The scene begins by requesting the camera, shapes, and materials it will need.
      { super(   context, control_box );    // First, include a secondary Scene that provides movement controls:
        if( !context.globals.has_controls   ) 

           Object.assign( this, { time_accumulator: 0, time_scale: 1, t: 0, dt: 1/20, bodies: [], steps_taken: 0 } ); 
          context.register_scene_component( new Movement_Controls( context, control_box.parentElement.insertCell() ) ); 

        context.globals.graphics_state.camera_transform = Mat4.look_at( Vec.of( 0,40,1 ), Vec.of( 0,10,-20 ), Vec.of( 0,5,2 ) );

        const r = context.width/context.height;
        context.globals.graphics_state.projection_transform = Mat4.perspective( Math.PI/4, r, .1, 1000 );
        this.comfirm=false;


        const shapes = { box:   new Cube(),
                         box_2: new Cube(),
                         dice: new Sub_Cube(),
                         axis:  new Arrows(),
                         square: new Square(),
                         gold: new Cube2(),

                         newtriangle: new newtriangle(),
                         circle: new Ding_Cycle(20,20),
                         cylinder: new Cylindrical_Tube(8,8),
                         cone: new Cone_Tip(),
                         Torus: new Torus(),
                         Closed_Cone : new Closed_Cone(8,8),
                         uprightcube: new halfcube(2),
                         upleftcube: new halfcube(1),
                         downrightcube: new halfcube(4),
                         downleftcube: new halfcube(3),
                        
                         //Rounded_Closed_Cone : new Rounded_Closed_Cone(),
                         //Capped_Cylinder :new Capped_Cylinder(),
                         //Rounded_Capped_Cylinder :new Rounded_Capped_Cylinder()
                         background: new Subdivision_Sphere(8),
                         qizi: new Airplane()
                       }
        shapes.background.normals=shapes.background.normals.map(x => x.times(-1));
        this.submit_shapes( context, shapes );

        // TODO:  Create the materials required to texture both cubes with the correct images and settings.
        //        Make each Material from the correct shader.  Phong_Shader will work initially, but when 
        //        you get to requirements 6 and 7 you will need different ones.
        this.materials =
          { phong: context.get_instance( Phong_Shader ).material( Color.of( 1,1,0,1 ) ),
            dice_texture: context.get_instance( Phong_Shader ).material( Color.of( 0,0,0,1 ), {ambient: 1, texture: context.get_instance("assets/dice2.png", true)}),
            airplane: context.get_instance( Phong_Shader ).material( Color.of( 0,1,0,1 ), {ambient: 0.5} ),
            sky_texture:context.get_instance( Phong_Shader ).material( Color.of( 0,0,0,1 ), 
                             { ambient: 1, texture: context.get_instance( "assets/sky_background.jpg" ) } ),
            bump_texture: context.get_instance( Bump_Shader ).material( Color.of( 0,0,0,1 ),
                             {ambient: 0.5, texture: [context.get_instance("assets/gold.png", true), context.get_instance("assets/question_normal.png", true)] }),
            winner_texture: context.get_instance( Bump_Shader ).material( Color.of( 0,0,0,1 ),
            {ambient: 0.5, texture: [context.get_instance("assets/gold.png", true), context.get_instance("assets/trophy.png", true)] })
        }
        this.lights = [ new Light( Vec.of( 5,20,0,1 ), Color.of( 0,1,1,1 ), 100000000 ) ];
        this.color=[Color.of(1,0,0,1), Color.of(0,0,1,1),Color.of(1,1,0,1),Color.of(0,1,0,1)];
        this.origin_location=Mat4.identity().times(Mat4.translation([0,0,-30]));

        this.white=Color.of(1,1,1,1);
         this.airplanescale=1;



        // rotate flags, if not the same, roll the dice
        this.rotate = false;
        this.saved_dice_model = Mat4.identity().times(Mat4.translation([-25, 0, -30])).times(Mat4.scale([2,2,2]));
        this.stop_time = 0;
        this.dice_enforced = false;
        this.dice_enforced_num = 0;
        this.saved_dice_result = 0;
        this.unknow_flag = false;

        this.gold_rotate = false;
        this.saved_gold_model = Mat4.identity().times(Mat4.translation([0,5,-30]));
        this.passed_gold_time = 0;
        this.drawsuccess=false;

                //implementation of board movment.

// inti the green borad position,if_same_color, spin
    this.board_green1 = new LinkedList();
    this.board_green1.add( Vec.of(-10,0,-36));
    this.board_green1.add(  Vec.of(-8,0,-36));
    this.board_green1.add( Vec.of(-6,0,-36));
    this.board_green1.add( Vec.of(-6,0,-36),false,-1 );
    this.board_green1.add( Vec.of(-6,0,-39),true);
    this.board_green1.add( Vec.of(-6,0,-41));
    this.board_green1.add( Vec.of(-6,0,-43), false, 1);
    this.board_green1.add( Vec.of(-4,0,-43));
    this.board_green1.add( Vec.of(-2,0,-43),true);
    this.board_green1.add( Vec.of(0,0,-43));
    this.board_green1.add( Vec.of(2,0,-43));
    this.board_green1.add( Vec.of(4,0,-43));
    this.board_green1.add( Vec.of(6,0,-43), true, 1);
    this.board_green1.add( Vec.of(6,0,-40));
    this.board_green1.add( Vec.of(6,0,-38));
    this.board_green1.add( Vec.of(6,0,-36));
    this.board_green1.add( Vec.of(6,0,-36), true, -1);
    this.board_green1.add( Vec.of(8,0,-36));
    this.board_green1.add( Vec.of(10,0,-36));
    this.board_green1.add( Vec.of(12,0,-36), false, 1);
    this.board_green1.add( Vec.of(12,0,-34),true);
    this.board_green1.add( Vec.of(12,0,-32));
    this.board_green1.add( Vec.of(12,0,-30));
    this.board_green1.add( Vec.of(12,0,-28));
    this.board_green1.add( Vec.of(12,0,-26), true);
    this.board_green1.add( Vec.of(12,0,-24),false,1);
    this.board_green1.add( Vec.of(9,0,-24));
    this.board_green1.add( Vec.of(7,0,-24));
    this.board_green1.add( Vec.of(5,0,-24),true);
    this.board_green1.add( Vec.of(5,0,-24),false,-1);
    this.board_green1.add( Vec.of(5,0,-22));
    this.board_green1.add( Vec.of(5,0,-20));
    this.board_green1.add( Vec.of(5,0,-18),true, 1);
    this.board_green1.add( Vec.of(3,0,-18));
    this.board_green1.add( Vec.of(1,0,-18));
    this.board_green1.add( Vec.of(-1,0,-18));
    this.board_green1.add( Vec.of(-3,0,-18),true);
    this.board_green1.add( Vec.of(-5,0,-18));
    this.board_green1.add( Vec.of(-7,0,-18),false,1);
    this.board_green1.add( Vec.of(-7,0,-21));
    this.board_green1.add( Vec.of(-7,0,-23),true);
    this.board_green1.add( Vec.of(-7,0,-25));
    this.board_green1.add( Vec.of(-7,0,-25),false,-1);
    this.board_green1.add( Vec.of(-9,0,-25));
    this.board_green1.add( Vec.of(-11,0,-25),true);
    this.board_green1.add( Vec.of(-13,0,-25),false,1);
    this.board_green1.add( Vec.of(-13,0,-27));
    this.board_green1.add( Vec.of(-13,0,-29));
    this.board_green1.add( Vec.of(-13,0,-31),false, 1);
    this.board_green1.add( Vec.of(-10,0,-31));
    this.board_green1.add( Vec.of(-8,0,-31));
    this.board_green1.add( Vec.of(-6,0,-31));
    this.board_green1.add( Vec.of(-4,0,-31));
    this.board_green1.add( Vec.of(-2,0,-31));
    this.board_green1.add( Vec.of( 0,0,-31));

    this.board_green1.current = this.board_green1.head;
    this.board_green2 = new LinkedList();
    this.board_green3 = new LinkedList();
    this.board_green4 = new LinkedList();
    Object.assign(this.board_green2, this.board_green1);
    Object.assign(this.board_green3, this.board_green1);
    Object.assign(this.board_green4, this.board_green1);

    

    // inti the red borad position,if_same_color, spin
    this.board_red1 = new LinkedList();
    this.board_red1.add( Vec.of(6,0,-40));
    this.board_red1.add( Vec.of(6,0,-38));
    this.board_red1.add( Vec.of(6,0,-36));
    this.board_red1.add( Vec.of(6,0,-36), false, -1);
    this.board_red1.add( Vec.of(8,0,-36),true);
    this.board_red1.add( Vec.of(10,0,-36));
    this.board_red1.add( Vec.of(12,0,-36), false, 1);
    this.board_red1.add( Vec.of(12,0,-34));
    this.board_red1.add( Vec.of(12,0,-32),true);
    this.board_red1.add( Vec.of(12,0,-30));
    this.board_red1.add( Vec.of(12,0,-28));
    this.board_red1.add( Vec.of(12,0,-26));
    this.board_red1.add( Vec.of(12,0,-24),true,1);
    this.board_red1.add( Vec.of(9,0,-24));
    this.board_red1.add( Vec.of(7,0,-24));
    this.board_red1.add( Vec.of(5,0,-24));
    this.board_red1.add( Vec.of(5,0,-24),true,-1);
    this.board_red1.add( Vec.of(5,0,-22));
    this.board_red1.add( Vec.of(5,0,-20));
    this.board_red1.add( Vec.of(5,0,-18),false, 1);
    this.board_red1.add( Vec.of(3,0,-18),true);
    this.board_red1.add( Vec.of(1,0,-18));
    this.board_red1.add( Vec.of(-1,0,-18));
    this.board_red1.add( Vec.of(-3,0,-18));
    this.board_red1.add( Vec.of(-5,0,-18),true);
    this.board_red1.add( Vec.of(-7,0,-18),false,1);
    this.board_red1.add( Vec.of(-7,0,-21));
    this.board_red1.add( Vec.of(-7,0,-23));
    this.board_red1.add( Vec.of(-7,0,-25),true);
    this.board_red1.add( Vec.of(-7,0,-25),false,-1);
    this.board_red1.add( Vec.of(-9,0,-25));
    this.board_red1.add( Vec.of(-11,0,-25));
    this.board_red1.add( Vec.of(-13,0,-25),true,1);
    this.board_red1.add( Vec.of(-13,0,-27));
    this.board_red1.add( Vec.of(-13,0,-29));
    this.board_red1.add( Vec.of(-13,0,-31));
    this.board_red1.add( Vec.of(-13,0,-33),true);
    this.board_red1.add( Vec.of(-13,0,-35));
    this.board_red1.add( Vec.of(-13,0,-37), false , 1);
    this.board_red1.add( Vec.of(-10,0,-37));
    this.board_red1.add( Vec.of(-8,0,-37),true);
    this.board_red1.add( Vec.of(-6,0,-37));
    this.board_red1.add( Vec.of(-6,0,-37), false, -1);
    this.board_red1.add( Vec.of(-6,0,-39));
    this.board_red1.add( Vec.of(-6,0,-41), true );
    this.board_red1.add( Vec.of(-6,0,-43), false, 1);
    this.board_red1.add( Vec.of(-4,0,-43));
    this.board_red1.add( Vec.of(-2,0,-43));
    this.board_red1.add( Vec.of(0,0,-43), false, 1);
    this.board_red1.add( Vec.of(0,0,-40));
    this.board_red1.add( Vec.of(0,0,-38));
    this.board_red1.add( Vec.of(0,0,-36));
    this.board_red1.add( Vec.of(0,0,-34));
    this.board_red1.add( Vec.of(0,0,-32));
    this.board_red1.add( Vec.of(0,0,-30));

    this.board_red1.current = this.board_red1.head;
    this.board_red2 = new LinkedList();
    this.board_red3 = new LinkedList();
    this.board_red4 = new LinkedList();


    Object.assign(this.board_red2, this.board_red1);
    Object.assign(this.board_red3, this.board_red1);
    Object.assign(this.board_red4, this.board_red1);



    //initialize green plane 1
    this.green_plane1 = new plane(Vec.of(-13,0,-43), Color.of(0,1,0,1), Mat4.rotation( Math.PI/2 , Vec.of( 0, 1, 0 ) ) );
    this.green_plane2 = new plane(Vec.of(-11,0,-43), Color.of(0,1,0,1), Mat4.rotation( Math.PI/2 , Vec.of( 0, 1, 0 ) ) );
    this.green_plane3 = new plane(Vec.of(-11,0,-41), Color.of(0,1,0,1), Mat4.rotation( Math.PI/2 , Vec.of( 0, 1, 0 ) ) );
    this.green_plane4 = new plane(Vec.of(-13,0,-41), Color.of(0,1,0,1), Mat4.rotation( Math.PI/2 , Vec.of( 0, 1, 0 ) ) );
    //initialize green plane 1
    this.red_plane1 = new plane(Vec.of(11,0,-43), Color.of(1,0,0,1), Mat4.identity() );
    this.red_plane2 = new plane(Vec.of(13,0,-43), Color.of(1,0,0,1), Mat4.identity() );
    this.red_plane3 = new plane(Vec.of(13,0,-41), Color.of(1,0,0,1), Mat4.identity() );
    this.red_plane4 = new plane(Vec.of(11,0,-41), Color.of(1,0,0,1), Mat4.identity() );

    //play order
    this.order = 1;

    //general_active
    this.active = 0; 


    //who win
    // 1: green wins
    // 2: red wins
    this.winner = 0;
        this.demoflag=0;
       


        //------------------modified by elina
        this.airplanescale=3;
        this.greenchess =[];
        this.redchess=[];
        this.yellowchess=[];
        this.bluechess=[];


      }
    make_control_panel()
      { // press c to roll the dice and get random result
      // for demo purpose, press 1 to 6 to get enforced dice result
      this.key_triggered_button( "roll dice", [ "c" ], () => {this.rotate ^= 1});
      this.key_triggered_button( "dice gives 1", ["1"], 
          () => {this.dice_enforced = true; this.rotate ^= 1; this.dice_enforced_num = 1});
      this.key_triggered_button( "dice gives 2", ["2"], 
          () => {this.dice_enforced = true; this.rotate ^= 1; this.dice_enforced_num = 2});
      this.key_triggered_button( "dice gives 3", ["3"], 
          () => {this.dice_enforced = true; this.rotate ^= 1; this.dice_enforced_num = 3});
      this.key_triggered_button( "dice gives 4", ["4"], 
          () => {this.dice_enforced = true; this.rotate ^= 1; this.dice_enforced_num = 4});
      this.key_triggered_button( "dice gives 5", ["5"], 
          () => {this.dice_enforced = true; this.rotate ^= 1; this.dice_enforced_num = 5});
      this.key_triggered_button( "dice gives 6", ["6"], 
          () => {this.dice_enforced = true; this.rotate ^= 1; this.dice_enforced_num = 6}); this.new_line();
      
      this.key_triggered_button( "choose plane 1", ["y"], 
          () => {this.active = 1});
      this.key_triggered_button( "choose plane 2", ["u"], 
          () => {this.active = 2});
      this.key_triggered_button( "choose plane 3", ["j"], 
          () => {this.active = 3});
      this.key_triggered_button( "choose plane 4", ["h"], 
          () => {this.active = 4}); this.new_line();

      this.key_triggered_button( "show plane 1", ["i"], 
          () => {this.green_plane1.if_shine ^= 1; this.red_plane1.if_shine ^= 1});
      this.key_triggered_button( "show plane 2", ["o"], 
          () => {this.green_plane2.if_shine ^= 1; this.red_plane2.if_shine ^= 1});
      this.key_triggered_button( "show plane 3", ["l"], 
          () => {this.green_plane3.if_shine ^= 1; this.red_plane3.if_shine ^= 1});
      this.key_triggered_button( "show plane 4", ["k"], 
          () => {this.green_plane4.if_shine ^= 1; this.red_plane4.if_shine ^= 1}); this.new_line();
        
    this.key_triggered_button( "start/stop gold rotation", [ "g" ], () => {this.gold_rotate ^= 1});

    this.key_triggered_button( "green win", [ "8" ], () => {this.winner = 1});
    this.key_triggered_button( "red win", [ "9" ], () => {this.winner = 2});
      }

  
  testAABB( b, c )
  {
    var s=1;
            let bx=b.drawn_location[0][3];
            let by=b.drawn_location[1][3];
            let bz=b.drawn_location[2][3];
       
            let bleft=bx-s-2.5;
            let bright=bx+s+2.5;
            let bupper=by+s/5;
            let blower=by-s/5; 
            let bforward=bz+s/2;
            let bbackward=bz-s/2;
            let cx=c.drawn_location[0][3];
            let cy=c.drawn_location[1][3];
            let cz=c.drawn_location[2][3];
            let cleft=cx-s-2.5;
            let cright=cx+s+2.5;
            let cupper=cy+s/5;
            let clower=cy-s/5;
            let cforward=cz+s/2;
            let cbackward=cz-s/2;
  if ( bupper < clower || cupper < blower ) return false;
  if ( bright < cleft || cright < bleft ) return false;
  if ( cforward < bbackward || bforward < cbackward ) return false;
  return true;
  }



success()
  {
    
        if (this.drawsuccess==false)
        {
  
      var loc=[-13,-43,11,-43,-13, -19, 11, -19];
      var temploc=[0,0,0,2,2,0,2,2];
      var model=Mat4.translation( [-13,0,-43]);
      for (let i=0;i<20;i+=2)
      {


     this.greenchess.push( new Body( this.shapes.box_2, this.materials.transparent, Vec.of( 1,1,1 ) )
        .emplace( model.times(Mat4.translation([1,10,20])).times(Mat4.scale([this.airplanescale,this.airplanescale,this.airplanescale])
          .times(Mat4.rotation(Math.PI/2, Vec.of(0,1,0))),
                  Vec.of( 1,0,0 ),1 ) ));

     model=model.times(Mat4.translation( [0,0,3]));

      }
      var model=Mat4.translation( [11,0,-43]);
      for (let i=0;i<20;i+=2)
      {
     this.redchess.push( new Body( this.shapes.box_2, this.materials.transparent, Vec.of( 1,1,1 ) )
        .emplace( model.times(Mat4.translation([1,10,-16])).times(Mat4.scale([this.airplanescale,this.airplanescale,this.airplanescale])
          .times(Mat4.rotation(-Math.PI/2, Vec.of(0,1,0))),
                  Vec.of( 1,0,0 ),1 ) ));

     model=model.times(Mat4.translation( [0,0,3]));
 }
 this.drawsuccess=true;

      }

  }

    simulate( frame_time )                              // Carefully advance time according to Glenn Fiedler's "Fix Your Timestep" blog post.
    { frame_time = this.time_scale * frame_time;    
                                                                 // the display framerate is running fast or slow.
                                                                   // Avoid the spiral of death; limit the amount of time we will spend 
      this.time_accumulator += Math.min( frame_time, 0.1 );        // computing during this timestep if display lags.
      while ( Math.abs( this.time_accumulator ) >= this.dt )       // Repeatedly step the simulation until we're caught up with this frame.
      {                              // Single step of the simulation for all bodies.
       
        for(let b of this.redchess)
        {
           b.linear_velocity= Vec.of(100*(Math.random()-0.5) ,100*(Math.random()-0.5) ,100*(Math.random()-0.5 ));
     
          b.advance( this.dt,-1);
        }
        for(let b of this.greenchess)
        {
          b.linear_velocity= Vec.of(100*(Math.random()-0.5) ,100*(Math.random()-0.5) ,100*(Math.random()-0.5 ));
          b.advance( this.dt,1);
        }

         for( let b of this.redchess )
        { 
          for( let c of this.greenchess ) 
          {    
           if (this.testAABB(b,c)){                 
            b.stopnow(1);
            c.stopnow(1);
            console.log('here');

           }
          } 
        }

        this.t                += Math.sign( frame_time ) * this.dt;   // Following the advice of the article, de-couple
        this.time_accumulator -= Math.sign( frame_time ) * this.dt;   // our simulation time from our frame rate.
        this.steps_taken++;
      
      let alpha = this.time_accumulator / this.dt;   
             
      for(let b of this.redchess)
        {
          b.blend_state( alpha );
        } 
        for(let b of this.greenchess)
        {
          b.blend_state( alpha );
        } 



             // the two latest simulation time steps, so we can correctly blend the
    }
    }


      drawplane(graphics_state)
{
   //origin_location=Mat4.identity().times(Mat4.translation([0,0,-30]));
        var planelocation=this.origin_location.times(Mat4.translation([-13,0,-13]));
        this.drawairport(graphics_state,planelocation,3);
        planelocation=planelocation.times(Mat4.translation([1,0,4]));
        this.shapes.axis.draw(graphics_state,planelocation, this.materials.phong.override({color:this.white}));
        planelocation=planelocation.times(Mat4.translation([-2,1,4]));
        //this.shapes.circle.draw(graphics_state,planelocation,this.materials.phong.override({color:this.white}));


        planelocation=this.origin_location.times(Mat4.translation([-13,0,11]));
        this.drawairport(graphics_state,planelocation,2);
       planelocation=planelocation.times(Mat4.translation([4,0,1]))
                                     .times(Mat4.rotation(Math.PI/2, Vec.of(0,1,0)));
        this.shapes.axis.draw(graphics_state,planelocation, this.materials.phong.override({color:this.white}));
        planelocation=planelocation.times(Mat4.translation([-3,1,2]));
        //this.shapes.circle.draw(graphics_state,planelocation,this.materials.phong.override({color:this.white}));


        planelocation=this.origin_location.times(Mat4.translation([11,0,-13]));
        this.drawairport(graphics_state,planelocation,0);
        planelocation=planelocation.times(Mat4.translation([-2,0,1]))
                                      .times(Mat4.rotation(-Math.PI/2, Vec.of(0,1,0)));
        this.shapes.axis.draw(graphics_state,planelocation, this.materials.phong.override({color:this.white}));
         planelocation=planelocation.times(Mat4.translation([0,1,2]));
       // this.shapes.circle.draw(graphics_state,planelocation,this.materials.phong.override({color:this.white}));


        planelocation=this.origin_location.times(Mat4.translation([11,0,11]));
        this.drawairport(graphics_state,planelocation,1);
        planelocation=planelocation.times(Mat4.translation([1,0,-2]))
        .times(Mat4.rotation(Math.PI, Vec.of(0,1,0)));

        this.shapes.axis.draw(graphics_state,planelocation, this.materials.phong.override({color:this.white}));

        planelocation=planelocation.times(Mat4.translation([-2,1,0]));
        //this.shapes.circle.draw(graphics_state,planelocation,this.materials.phong.override({color:this.white}));


}
    drawfive(model_transform,graphics_state,cubenum,byrow,color,pos,jump=0, center=5)
    {
      var i;
      var modelt=model_transform;
      var colorcount=color;

      if (byrow)
      {
      for ( i=-cubenum+1;i<cubenum;i+=2){
          if (colorcount>3)
          {
            colorcount=0;
          }
          if (colorcount<0)
          {
            colorcount=3;
          }
          model_transform=modelt.times(Mat4.translation([i+jump,-1.01,0]));
          if (center==5)
          {
          this.shapes.box_2.draw(graphics_state, model_transform, this.materials.phong.override({color:this.color[colorcount]}));
        }
        else
          this.shapes.box_2.draw(graphics_state, model_transform, this.materials.phong.override({color:this.color[center]}));


          model_transform=model_transform.times(Mat4.translation([0,1.01,0]))
          .times(Mat4.scale([0.5,0.5,0.5]));
          this.shapes.circle.draw(graphics_state, model_transform, this.materials.phong.override({color:Color.of(0.95,0.95,0.95,1)}));
          if (pos)
          {colorcount=colorcount+1;}
        else
        {colorcount=colorcount-1;}

        }
      }
      else
      {
        for ( i=-cubenum+1;i<cubenum;i+=2){
          if (colorcount >3)
          {
            colorcount=0;
          }
          if (colorcount <0)
          {
            colorcount=3;
          }

          model_transform=modelt.times(Mat4.translation([0,-1.01,i+jump]));
          if (center ==5)
          this.shapes.box_2.draw(graphics_state, model_transform, this.materials.phong.override({color:this.color[colorcount]}));
        else
          this.shapes.box_2.draw(graphics_state, model_transform, this.materials.phong.override({color:this.color[center]}));

          model_transform=model_transform.times(Mat4.translation([0,1.01,0]))
           .times(Mat4.scale([0.5,0.5,0.5]));
          this.shapes.circle.draw(graphics_state, model_transform, this.materials.phong.override({color:Color.of(0.95,0.95,0.95,1)}));
         if (pos)
          {colorcount=colorcount+1;}
        else
        {colorcount=colorcount-1;}

        }
        }

      }
    
    drawairport(graphics_state,planelocation,color)
    {
      planelocation=planelocation.times(Mat4.translation([0,-1.01,0]));
          this.shapes.box_2.draw(graphics_state, planelocation, this.materials.phong.override({color:this.color[color]}));
      planelocation=planelocation.times(Mat4.translation([0,1.01,0]))
           .times(Mat4.scale([0.7,0.7,0.5]));
      this.shapes.circle.draw(graphics_state, planelocation, this.materials.phong.override({color:this.white}));



       planelocation=planelocation.times(Mat4.scale([10/7,10/7,2]))
                                    .times(Mat4.translation([2,-1.01,0]));
          this.shapes.box_2.draw(graphics_state, planelocation, this.materials.phong.override({color:this.color[color]}));
      planelocation=planelocation.times(Mat4.translation([0,1.01,0]))
           .times(Mat4.scale([0.7,0.7,0.5]));
      this.shapes.circle.draw(graphics_state, planelocation, this.materials.phong.override({color:this.white}));



      planelocation=planelocation.times(Mat4.scale([10/7,10/7,2]))
      .times(Mat4.translation([0,-1.01,2]));
          this.shapes.box_2.draw(graphics_state, planelocation, this.materials.phong.override({color:this.color[color]}));
      planelocation=planelocation.times(Mat4.translation([0,1.01,0]))
           .times(Mat4.scale([0.7,0.7,0.5]));
      this.shapes.circle.draw(graphics_state, planelocation, this.materials.phong.override({color:this.white}));

       planelocation=planelocation .times(Mat4.scale([10/7,10/7,2]))
       .times(Mat4.translation([-2,-1.01,0]));
      this.shapes.box_2.draw(graphics_state, planelocation, this.materials.phong.override({color:this.color[color]}));
      planelocation=planelocation.times(Mat4.translation([0,1.01,0]))
           .times(Mat4.scale([0.7,0.7,0.5]));
      this.shapes.circle.draw(graphics_state, planelocation, this.materials.phong.override({color:this.white}));
    }

  board_movement_helper(dice_result,t)
    {
       //addition parts for borad movment
        

        this.order++;
        this.order %= 2;

        switch(this.order) 
        {
            case 0:

                switch(this.active)
                {
                    case 1:

                if(dice_result == 6)
                {   
                    if(!this.green_plane1.if_start)
                    {
                        this.green_plane1.if_start = true;
                        this.green_plane1.plane_model_transform = this.board_green1.current.position;
                        this.order--;
                        dice_result = 0;
                   }
                   else
                   {
                       this.green_plane1.number_from_dice = dice_result;
                       this.order--; 
                   }
                }
                else if( this.green_plane1.if_start)
                    this.green_plane1.number_from_dice = dice_result;
                
                this.active = 0;
                break;

                case 2:

                if(dice_result == 6)
                {   
                    if(!this.green_plane2.if_start)
                    {
                        this.green_plane2.if_start = true;
                        this.green_plane2.plane_model_transform = this.board_green2.current.position;
                        this.order--;
                        dice_result = 0;
                   }
                   else
                   {
                       this.green_plane2.number_from_dice = dice_result;
                       this.order--; 
                   }
                }
                else if( this.green_plane2.if_start)
                    this.green_plane2.number_from_dice = dice_result;
                
                this.active = 0;
                break;

                case 3:

                if(dice_result == 6)
                {   
                    if(!this.green_plane3.if_start)
                    {
                        this.green_plane3.if_start = true;
                        this.green_plane3.plane_model_transform = this.board_green3.current.position;
                        this.order--;
                        dice_result = 0;
                   }
                   else
                   {
                       this.green_plane3.number_from_dice = dice_result;
                       this.order--; 
                   }
                }
                else if( this.green_plane3.if_start)
                    this.green_plane3.number_from_dice = dice_result;
                
                this.active = 0;
                break;

                case 4:

                if(dice_result == 6)
                {   
                    if(!this.green_plane4.if_start)
                    {
                        this.green_plane4.if_start = true;
                        this.green_plane4.plane_model_transform = this.board_green4.current.position;
                        this.order--;
                        dice_result = 0;
                   }
                   else
                   {
                       this.green_plane4.number_from_dice = dice_result;
                       this.order--; 
                   }
                }
                else if( this.green_plane4.if_start)
                    this.green_plane4.number_from_dice = dice_result;
                
                this.active = 0;
                break;

                default:
                break


                }
                


                break;
            case 1:

                switch(this.active)
                {
                    case 1:

                if(dice_result == 6)
                {   
                    if(!this.red_plane1.if_start)
                    {
                        this.red_plane1.if_start = true;
                        this.red_plane1.plane_model_transform = this.board_red1.current.position;
                        this.order--;
                        dice_result = 0;
                   }
                   else
                   {
                       this.red_plane1.number_from_dice = dice_result;
                       this.order--; 
                   }
                }
                else if( this.red_plane1.if_start)
                    this.red_plane1.number_from_dice = dice_result;
                
                this.active = 0;
                break;

                case 2:

                if(dice_result == 6)
                {   
                    if(!this.red_plane2.if_start)
                    {
                        this.red_plane2.if_start = true;
                        this.red_plane2.plane_model_transform = this.board_red2.current.position;
                        this.order--;
                        dice_result = 0;
                   }
                   else
                   {
                       this.red_plane2.number_from_dice = dice_result;
                       this.order--; 
                   }
                }
                else if( this.red_plane2.if_start)
                    this.red_plane2.number_from_dice = dice_result;
                
                this.active = 0;
                break;

                case 3:

                if(dice_result == 6)
                {   
                    if(!this.red_plane3.if_start)
                    {
                        this.red_plane3.if_start = true;
                        this.red_plane3.plane_model_transform = this.board_red3.current.position;
                        this.order--;
                        dice_result = 0;
                   }
                   else
                   {
                       this.red_plane3.number_from_dice = dice_result;
                       this.order--; 
                   }
                }
                else if( this.red_plane3.if_start)
                    this.red_plane3.number_from_dice = dice_result;
                
                this.active = 0;
                break;

                case 4:

                if(dice_result == 6)
                {   
                    if(!this.red_plane4.if_start)
                    {
                        this.red_plane4.if_start = true;
                        this.red_plane4.plane_model_transform = this.board_red4.current.position;
                        this.order--;
                        dice_result = 0;
                   }
                   else
                   {
                       this.red_plane4.number_from_dice = dice_result;
                       this.order--; 
                   }
                }
                else if( this.red_plane4.if_start)
                    this.red_plane4.number_from_dice = dice_result;
                
                this.active = 0;
                break;

                default:
                break


                }
                


                break;
            default:
                break;
        }
    }    


    drawDice(graphics_state, t) {
      // init dice location
      let model_transform_dice_spin = Mat4.identity().times(Mat4.translation([-25, 0, -30]));
      let model_transform_dice_result = Mat4.identity().times(Mat4.translation([-25, 0, -30]));

      // rolling dice animation
      model_transform_dice_spin = model_transform_dice_spin.times(Mat4.rotation(10 * t * Math.PI, Vec.of(1,0,0)));
      model_transform_dice_spin = model_transform_dice_spin.times(Mat4.rotation(10 * t * Math.PI, Vec.of(0,1,0)));
      model_transform_dice_spin = model_transform_dice_spin.times(Mat4.rotation(10 * t * Math.PI, Vec.of(0,0,1)));

      model_transform_dice_spin = model_transform_dice_spin.times(Mat4.scale([2,2,2]));
      model_transform_dice_result = model_transform_dice_result.times(Mat4.scale([2,2,2]));

      // roll dice for 2 seconds
      if (this.rotate) {
        this.stop_time = t + 1.5;
        this.rotate = false;
        //use for choosing
        this.unknow_flag = true;
        
        // roll dice get random result
        // or based on enforced numbers
        var dice_result;
        if (this.dice_enforced) {
          dice_result = this.dice_enforced_num;
          this.dice_enforced = false;
        } else {
          dice_result = Math.floor(Math.random() * 6) + 1;
        }
        
        switch (dice_result) {
          case 1:
            model_transform_dice_result = model_transform_dice_result.times(Mat4.rotation(Math.PI/2, Vec.of(-1, 0, 0))); break;
          case 2:
            model_transform_dice_result = model_transform_dice_result.times(Mat4.rotation(Math.PI/2, Vec.of(0, 1, 0))); break;
          case 3:
            model_transform_dice_result = model_transform_dice_result.times(Mat4.rotation(Math.PI/2, Vec.of(0, 0, -1))); break;
          case 4:
            model_transform_dice_result = model_transform_dice_result.times(Mat4.rotation(Math.PI/2, Vec.of(0, 0, 1))); break;
          case 5:
            model_transform_dice_result = model_transform_dice_result.times(Mat4.rotation(Math.PI, Vec.of(-1, 0, 0))); break;
          case 6:
            model_transform_dice_result = model_transform_dice_result.times(Mat4.rotation(Math.PI/2, Vec.of(1, 0, 0))); break;
          default:
            break;
        }

        this.saved_dice_model = model_transform_dice_result;
        this.saved_dice_result = dice_result;

      }


      if (this.stop_time > t) 
      {
        this.shapes.dice.draw(graphics_state, model_transform_dice_spin, this.materials.dice_texture);
      } else {
        this.shapes.dice.draw(graphics_state, this.saved_dice_model, this.materials.dice_texture);
      }
    }

    draw_airplane(graphics_state, model_transform, material)
    {

        //draw the sample airplane 
        model_transform = model_transform.times(Mat4.translation([0,0.5,0]));
        this.shapes.qizi.draw(graphics_state, model_transform, material);


    }

    move_plane(graphics_state, plane, board)
    {
        const t = graphics_state.animation_time / 1000, dt = graphics_state.animation_delta_time / 1000;
        
        if( plane.number_from_dice!= 0 && this.stop_time < t)
        {   
            var move = board.current.next.position.minus(board.current.position );
            if( !( plane.plane_model_transform.special_equals( board.current.next.position ) ) )
            {
              plane.plane_model_transform = plane.plane_model_transform.plus( move.normalized().times(0.2)  );
            }
            else
            {
                plane.number_from_dice--;
                if( board.move_to_next() )
                {
                    if(board.current.spin === -1)
                        plane.plane_model_rotate = plane.plane_model_rotate.times( Mat4.rotation(  Math.PI/2,[0,1,0],  ) );
                    else if(board.current.spin === 1)
                        plane.plane_model_rotate = plane.plane_model_rotate.times( Mat4.rotation( Math.PI/2, [0,-1,0]  ) );
                        
                    if( plane.number_from_dice == 0 && board.current.color && !plane.jumped)
                    {
                        plane.number_from_dice = 4;
                        plane.jumped = true;
                    }   
                    else if(plane.number_from_dice == 0 && board.current.color && plane.jumped)
                        plane.jumped = false;
                }
                else
                    plane.destination = true;
            }
        }

        if(plane.if_shine)
            this.draw_airplane(graphics_state, Mat4.translation( plane.plane_model_transform ).times( plane.plane_model_rotate), this.materials.airplane.override({color:plane.color, ambient: 0.5+0.5*Math.sin(2*t)} ) );
        else
            this.draw_airplane(graphics_state, Mat4.translation( plane.plane_model_transform ).times( plane.plane_model_rotate), this.materials.airplane.override({color:plane.color} ) );
                
        
    }

    draw_start_airplane(graphics_state, plane)
    {
        const t = graphics_state.animation_time / 1000, dt = graphics_state.animation_delta_time / 1000;
        if(plane.if_shine)
            this.draw_airplane(graphics_state, Mat4.translation( plane.plane_start_location ).times( plane.plane_model_rotate), this.materials.airplane.override({color:plane.color, ambient: 0.5+0.5*Math.sin(2*t)} ) );
        else
            this.draw_airplane(graphics_state, Mat4.translation( plane.plane_start_location ).times( plane.plane_model_rotate), this.materials.airplane.override({color:plane.color} ) );
    }


    draw_corner(graphics_state)
    {
       //lowerleft

        var model_transform=Mat4.identity();
        //center
        var model_transformset=model_transform.times(Mat4.translation([-12,0,-30]));
        model_transformset=model_transformset.times(Mat4.translation([6,0,6]));
        var leftlocal=model_transformset
                          .times( Mat4.rotation( Math.PI , Vec.of( 0, 1, 0 ) ) )
                          .times(Mat4.translation([0,-1,0]));              
        this.shapes.upleftcube.draw(graphics_state, leftlocal, this.materials.phong.override({color:this.color[0]}));
        var circlelocal=leftlocal.times(Mat4.translation([-0.35,1.01,-0.35]))
           .times(Mat4.scale([0.4,0.4,0.4]));
        this.shapes.circle.draw(graphics_state, circlelocal, this.materials.phong.override({color:this.white}));
        //
        leftlocal=model_transformset
                          .times( Mat4.rotation( Math.PI/2 , Vec.of( 0, 1, 0 ) ) )
                          .times(Mat4.translation([0,-1,0]));              
        this.shapes.uprightcube.draw(graphics_state, leftlocal, this.materials.phong.override({color:this.color[1]}));
        circlelocal=leftlocal.times(Mat4.translation([0.35,1.01,-0.35]))
           .times(Mat4.scale([0.4,0.4,0.4]));
        this.shapes.circle.draw(graphics_state, circlelocal, this.materials.phong.override({color:this.white}));
        //                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               


        // left
        leftlocal=model_transformset
                          .times( Mat4.rotation( -Math.PI/2 , Vec.of( 0, 1, 0 ) ) )
                          .times(Mat4.translation([0,-1,6]));              
        this.shapes.upleftcube.draw(graphics_state, leftlocal, this.materials.phong.override({color:this.color[0]}));
        circlelocal=leftlocal.times(Mat4.translation([-0.3,1.01,-0.3]))
           .times(Mat4.scale([0.5,0.5,0.5]));
        this.shapes.circle.draw(graphics_state, circlelocal, this.materials.phong.override({color:this.white}));
        //

        //bottom
        leftlocal=leftlocal .times(Mat4.translation([6,0,-6]));            
        this.shapes.upleftcube.draw(graphics_state, leftlocal, this.materials.phong.override({color:this.color[1]}));
        circlelocal=leftlocal.times(Mat4.translation([-0.3,1.01,-0.3]))
           .times(Mat4.scale([0.5,0.5,0.5]));
        this.shapes.circle.draw(graphics_state, circlelocal, this.materials.phong.override({color:this.white}));
        //

        model_transformset=model_transformset.times(Mat4.translation([0,0,-12]));


        //upleft ---------------------
       //center
        leftlocal=model_transformset
                          .times( Mat4.rotation( 0 , Vec.of( 0, 1, 0 ) ) )
                          .times(Mat4.translation([0,-1,0]));              
        this.shapes.uprightcube.draw(graphics_state, leftlocal, this.materials.phong.override({color:this.color[2]}));
        circlelocal=leftlocal.times(Mat4.translation([0.35,1.01,-0.35]))
           .times(Mat4.scale([0.4,0.4,0.4]));
        this.shapes.circle.draw(graphics_state, circlelocal, this.materials.phong.override({color:this.white}));
        //
        leftlocal=model_transformset
                          .times( Mat4.rotation( Math.PI , Vec.of( 0, 1, 0 ) ) )
                          .times(Mat4.translation([0,-1,0]));              
        this.shapes.uprightcube.draw(graphics_state, leftlocal, this.materials.phong.override({color:this.color[1]}));
        circlelocal=leftlocal.times(Mat4.translation([0.35,1.01,-0.35]))
           .times(Mat4.scale([0.4,0.4,0.4]));
        this.shapes.circle.draw(graphics_state, circlelocal, this.materials.phong.override({color:this.white}));
        //

        //left
        leftlocal=model_transformset
                          .times( Mat4.rotation( -Math.PI/2 , Vec.of( 0, 1, 0 ) ) )
                          .times(Mat4.translation([0,-1,6]));              
        this.shapes.uprightcube.draw(graphics_state, leftlocal, this.materials.phong.override({color:this.color[2]}));
        circlelocal=leftlocal.times(Mat4.translation([0.3,1.01,-0.3]))
           .times(Mat4.scale([0.5,0.5,0.5]));
        this.shapes.circle.draw(graphics_state, circlelocal, this.materials.phong.override({color:this.white}));
        //

        //up
        leftlocal=leftlocal.times(Mat4.translation([-6,0,-6]));            
        this.shapes.uprightcube.draw(graphics_state, leftlocal, this.materials.phong.override({color:this.color[1]}));
        circlelocal=leftlocal.times(Mat4.translation([0.3,1.01,-0.3]))
           .times(Mat4.scale([0.5,0.5,0.5]));
        this.shapes.circle.draw(graphics_state, circlelocal, this.materials.phong.override({color:this.white}));
        //-------------------------------

         model_transformset=Mat4.identity().times(Mat4.translation([12,0,-30]));
        model_transformset=model_transformset.times(Mat4.translation([-6,0,6]));

        //lowerright----------------
        //center
        leftlocal=model_transformset
                          .times( Mat4.rotation( Math.PI , Vec.of( 0, 1, 0 ) ) )
                          .times(Mat4.translation([0,-1,0]));              
        this.shapes.uprightcube.draw(graphics_state, leftlocal, this.materials.phong.override({color:this.color[0]}));
        circlelocal=leftlocal.times(Mat4.translation([0.35,1.01,-0.35]))
           .times(Mat4.scale([0.4,0.4,0.4]));
        this.shapes.circle.draw(graphics_state, circlelocal, this.materials.phong.override({color:this.white}));
        //
        leftlocal=model_transformset
                          //.times( Mat4.rotation( Math.PI/2 , Vec.of( 0, 1, 0 ) ) )
                          .times(Mat4.translation([0,-1,0]));              
        this.shapes.uprightcube.draw(graphics_state, leftlocal, this.materials.phong.override({color:this.color[3]}));
        circlelocal=leftlocal.times(Mat4.translation([0.35,1.01,-0.35]))
           .times(Mat4.scale([0.4,0.4,0.4]));
        this.shapes.circle.draw(graphics_state, circlelocal, this.materials.phong.override({color:this.white}));
        //



        //bottom
        leftlocal=model_transformset
                          .times( Mat4.rotation( 2*Math.PI , Vec.of( 0, 1, 0 ) ) )
                          .times(Mat4.translation([0,-1,6]));              
        this.shapes.upleftcube.draw(graphics_state, leftlocal, this.materials.phong.override({color:this.color[3]}));
        circlelocal=leftlocal.times(Mat4.translation([-0.3,1.01,-0.3]))
           .times(Mat4.scale([0.5,0.5,0.5]));
        this.shapes.circle.draw(graphics_state, circlelocal, this.materials.phong.override({color:this.white}));
        //

        //right
        leftlocal=leftlocal .times(Mat4.translation([6,0,-6]));            
        this.shapes.upleftcube.draw(graphics_state, leftlocal, this.materials.phong.override({color:this.color[0]}));
        circlelocal=leftlocal.times(Mat4.translation([-0.3,1.01,-0.3]))
           .times(Mat4.scale([0.5,0.5,0.5]));
        this.shapes.circle.draw(graphics_state, circlelocal, this.materials.phong.override({color:this.white}));
        //--------------------
    }

    display( graphics_state )
      { graphics_state.lights = this.lights;        // Use the lights stored in this.lights.
        const t = graphics_state.animation_time / 1000, dt = graphics_state.animation_delta_time / 1000;
      

        //let mt=Mat4.identity().times(Mat4.translation([0,30,60]));
        //graphics_state.camera_transform=Mat4.inverse(mt);

            this.simulate( graphics_state.animation_delta_time );
        let model_transform=Mat4.identity();
        this.drawplane(graphics_state);

        if (this.winner==1 || this.winner==2)
        {
            this.success();
        }
        //0 red 1 blue 2 yellow,3 green
         for( let b of this.greenchess)  
      {
       
          this.shapes.qizi.draw( graphics_state, b.drawn_location, this.materials.airplane ); 
        
      }
       for( let b of this.redchess)  
      {
       
          this.shapes.qizi.draw( graphics_state, b.drawn_location,  this.materials.airplane.override({color : this.color[0]})); 
        
      }




        var origin_location=Mat4.identity().times(Mat4.translation([0,0,-30]));
        var leftlocal=origin_location.times(Mat4.translation([20,0,0]));
        var circlelocal;

        var collisiondemo=Mat4.translation([20,0,0]);

       
         // uprightcube: 2
         // upleftcube: 1
         // downrightcube: 3
         // downleftcube: 4

        origin_location=Mat4.identity().times(Mat4.translation([0,0,-30]));
         
        var model_transformset=model_transform.times(Mat4.translation([-12,0,-30]));
        var i,j;
        //left
        this.drawfive(model_transformset,graphics_state,5, false,1,false);
        this.drawfive(model_transformset,graphics_state,5, true,1,true,6,3);
        model_transformset=model_transformset.times(Mat4.translation([6,0,6]));

        this.draw_corner(graphics_state);

       

        this.drawfive(model_transformset,graphics_state,2, true,3,false,-3);
        this.drawfive(model_transformset,graphics_state,2, false,3,false,3);
        model_transformset=model_transformset.times(Mat4.translation([0,0,-12]));
        this.drawfive(model_transformset,graphics_state,2, true,3,true,-3);
        this.drawfive(model_transformset,graphics_state,2, false,0,false,-3);

      
        //right
        model_transformset=Mat4.identity().times(Mat4.translation([12,0,-30]));
        this.drawfive(model_transformset,graphics_state,5, false,3,true);
        this.drawfive(model_transformset,graphics_state,5, true,1, false,-6,1);
        model_transformset=model_transformset.times(Mat4.translation([-6,0,6]))


        this.drawfive(model_transformset,graphics_state,2, true,2,false,3);
        this.drawfive(model_transformset,graphics_state,2, false,1,true,3);
        model_transformset=model_transformset.times(Mat4.translation([0,0,-12]));
        this.drawfive(model_transformset,graphics_state,2, true,0,true,3);
        this.drawfive(model_transformset,graphics_state,2, false,0,true,-3);
        
        //upright-------------------------------
        // center
        leftlocal=model_transformset
                          .times(Mat4.translation([0,-1,0]));              
        this.shapes.downrightcube.draw(graphics_state, leftlocal, this.materials.phong.override({color:this.color[3]}));
        circlelocal=leftlocal.times(Mat4.translation([0.35,1.01,0.35]))
           .times(Mat4.scale([0.4,0.4,0.4]));
        this.shapes.circle.draw(graphics_state, circlelocal, this.materials.phong.override({color:this.white}));
        //
        leftlocal=model_transformset
                          .times(Mat4.translation([0,-1,0]));              
        this.shapes.upleftcube.draw(graphics_state, leftlocal, this.materials.phong.override({color:this.color[2]}));
        circlelocal=leftlocal.times(Mat4.translation([-0.35,1.01,-0.35]))
           .times(Mat4.scale([0.4,0.4,0.4]));
        this.shapes.circle.draw(graphics_state, circlelocal, this.materials.phong.override({color:this.white}));
        //

        // right
        leftlocal=model_transformset
                          .times( Mat4.rotation( Math.PI/2 , Vec.of( 0, 1, 0 ) ) )
                          .times(Mat4.translation([0,-1,6]));              
        this.shapes.upleftcube.draw(graphics_state, leftlocal, this.materials.phong.override({color:this.color[2]}));
        circlelocal=leftlocal.times(Mat4.translation([-0.3,1.01,-0.3]))
           .times(Mat4.scale([0.5,0.5,0.5]));
        this.shapes.circle.draw(graphics_state, circlelocal, this.materials.phong.override({color:this.white}));
        //

        //up
        leftlocal=leftlocal.times(Mat4.translation([6,0,-6])); 
        this.shapes.upleftcube.draw(graphics_state, leftlocal, this.materials.phong.override({color:this.color[3]}));

       circlelocal=leftlocal.times(Mat4.translation([-0.3,1.01,-0.3]))
           .times(Mat4.scale([0.5,0.5,0.5]));
        this.shapes.circle.draw(graphics_state, circlelocal, this.materials.phong.override({color:this.white}));
        //------------------------------

        //bottom
        model_transformset=Mat4.identity().times(Mat4.translation([0,0,-18]));
        this.drawfive(model_transformset,graphics_state,5, false,1,true,-6,2);
        this.drawfive(model_transformset,graphics_state,5, true,0,false);

        //up
        model_transformset=Mat4.identity().times(Mat4.translation([0,0,-42]));
        this.drawfive(model_transformset,graphics_state,5, false,1,true,6,0);
        this.drawfive(model_transformset,graphics_state,5, true,2,true);


        this.drawDice(graphics_state, t);


        let model_transform_gold = Mat4.identity().times(Mat4.translation([0,5,-30]));
        if (!this.gold_rotate) {
          // not rotating
          model_transform_gold = this.saved_gold_model;
          this.passed_gold_time += dt;
        } else {
          // rotating
          model_transform_gold = model_transform_gold.times(Mat4.rotation(t * Math.PI / 10, Vec.of(0, 1, 0)));
          model_transform_gold = model_transform_gold.times(Mat4.rotation(this.passed_gold_time * Math.PI / 10, Vec.of(0, -1, 0)));
          this.saved_gold_model = model_transform_gold;
        }

        // TODO:  Draw the required boxes. Also update their stored matrices.
        this.shapes.gold.draw( graphics_state, model_transform_gold, this.materials.bump_texture);

        //call board_movement_helper function
        if(this.active != 0  && this.unknow_flag)
        {
            this.board_movement_helper(this.saved_dice_result,t);
            this.unknow_flag = false; 
        }

        //draw the background

        
        var bakground_model_transform = origin_location.times(Mat4.scale([100,100,100]));
        //if( !(this.winner == 1 || this.winner ==2) )
            this.shapes.background.draw(graphics_state, bakground_model_transform, this.materials.sky_texture);


        //demo aiplane movement
        
        //this.move_plane(graphics_state, this.red_plane1, this.board_red);
        
        
        if(this.green_plane1.if_start && !this.green_plane1.destination)
            this.move_plane(graphics_state, this.green_plane1, this.board_green1);
        else 
            this.draw_start_airplane(graphics_state, this.green_plane1);

        if(this.green_plane2.if_start&& !this.green_plane2.destination)
            this.move_plane(graphics_state, this.green_plane2, this.board_green2);
        else 
            this.draw_start_airplane(graphics_state, this.green_plane2);

        if(this.green_plane3.if_start&& !this.green_plane3.destination)
            this.move_plane(graphics_state, this.green_plane3, this.board_green3);
        else 
            this.draw_start_airplane(graphics_state, this.green_plane3);

        if(this.green_plane4.if_start&& !this.green_plane4.destination)
            this.move_plane(graphics_state, this.green_plane4, this.board_green4);
        else 
            this.draw_start_airplane(graphics_state, this.green_plane4);


        if(this.red_plane1.if_start && !this.red_plane1.destination)
            this.move_plane(graphics_state, this.red_plane1, this.board_red1);
        else 
            this.draw_start_airplane(graphics_state, this.red_plane1);

        if(this.red_plane2.if_start && !this.red_plane2.destination)
            this.move_plane(graphics_state, this.red_plane2, this.board_red2);
        else 
            this.draw_start_airplane(graphics_state, this.red_plane2);

        if(this.red_plane3.if_start && !this.red_plane3.destination)
            this.move_plane(graphics_state, this.red_plane3, this.board_red3);
        else 
            this.draw_start_airplane(graphics_state, this.red_plane3);

        if(this.red_plane4.if_start && !this.red_plane4.destination)
            this.move_plane(graphics_state, this.red_plane4, this.board_red4);
        else 
            this.draw_start_airplane(graphics_state, this.red_plane4);

      // chose winner
        if(this.green_plane1.destination && this.green_plane2.destination && this.green_plane3.destination && this.green_plane4.destination )
            this.winner = 1;
        else if (this.red_plane1.destination && this.red_plane2.destination && this.red_plane3.destination && this.red_plane4.destination )
            this.winner = 2;

        // draw winner scene
        let model_transform_winner = Mat4.identity();
        if (this.winner === 1) {
            model_transform_winner = model_transform_winner.times(Mat4.translation([-10, 20, -20]));
        } else if (this.winner === 2) {
            model_transform_winner = model_transform_winner.times(Mat4.translation([10, 20, -20]));
        }

        model_transform_winner = model_transform_winner.times(Mat4.scale([2, 2, 2]));
        model_transform_winner = model_transform_winner.times(Mat4.rotation(t / 2, Vec.of(0, 1, 0)));

        if (this.winner === 1 || this.winner === 2) {
            this.shapes.gold.draw( graphics_state, model_transform_winner, this.materials.winner_texture);
        }


      }
     
  }

// class Texture_Scroll_X extends Phong_Shader
// { fragment_glsl_code()           // ********* FRAGMENT SHADER ********* 
//     {
//       // TODO:  Modify the shader below (right now it's just the same fragment shader as Phong_Shader) for requirement #6.
//       return `
//         uniform sampler2D texture;
//         void main()
//         { if( GOURAUD || COLOR_NORMALS )    // Do smooth "Phong" shading unless options like "Gouraud mode" are wanted instead.
//           { gl_FragColor = VERTEX_COLOR;    // Otherwise, we already have final colors to smear (interpolate) across vertices.            
//             return;
//           }                                 // If we get this far, calculate Smooth "Phong" Shading as opposed to Gouraud Shading.
//                                                // Phong shading is not to be confused with the Phong Reflection Model.
      
//           vec2 new_tex_4 = f_tex_coord;

          


//           new_tex_4.x += ( mod(0.01*animation_time,1.0) );

//           vec4 tex_color = texture2D( texture, new_tex_4);                         // Sample the texture image in the correct place.
//                                                                                       // Compute an initial (ambient) color:
//           if( USE_TEXTURE ) gl_FragColor = vec4( ( tex_color.xyz + shapeColor.xyz ) * ambient, shapeColor.w * tex_color.w ); 
//           else gl_FragColor = vec4( shapeColor.xyz * ambient, shapeColor.w );
//           gl_FragColor.xyz += phong_model_lights( N );                     // Compute the final color with contributions from lights.
//         }`;
//     }
// }

// class Texture_Rotate extends Phong_Shader
// { fragment_glsl_code()           // ********* FRAGMENT SHADER ********* 
//     {
//       // TODO:  Modify the shader below (right now it's just the same fragment shader as Phong_Shader) for requirement #7.
//       return `
//         uniform sampler2D texture;
//         void main()
//         { if( GOURAUD || COLOR_NORMALS )    // Do smooth "Phong" shading unless options like "Gouraud mode" are wanted instead.
//           { gl_FragColor = VERTEX_COLOR;    // Otherwise, we already have final colors to smear (interpolate) across vertices.            
//             return;
//           }                                 // If we get this far, calculate Smooth "Phong" Shading as opposed to Gouraud Shading.
//                                             // Phong shading is not to be confused with the Phong Reflection Model.
//           const float PI = 3.1415926535897932384626433832795;
//           mat2 rotation_matrix;
//           rotation_matrix[0] = vec2( cos( mod( animation_time*PI/100.0, 2.0*PI) ), sin( mod( animation_time*PI/100.0, 2.0*PI) ) );
//           rotation_matrix[1] = vec2( -sin( mod( animation_time*PI/100.0, 2.0*PI) ), cos( mod( animation_time*PI/100.0, 2.0*PI) ) );
//           vec2 new_tex_coord = f_tex_coord;
//           new_tex_coord[0] += -0.5;
//           new_tex_coord[1] += -0.5;
//           new_tex_coord = rotation_matrix * new_tex_coord;
//           new_tex_coord[0] += 0.5;
//           new_tex_coord[1] += 0.5;
//           vec4 tex_color = texture2D( texture, new_tex_coord );                         // Sample the texture image in the correct place.
//                                                                                       // Compute an initial (ambient) color:
//           if( USE_TEXTURE ) gl_FragColor = vec4( ( tex_color.xyz + shapeColor.xyz ) * ambient, shapeColor.w * tex_color.w ); 
//           else gl_FragColor = vec4( shapeColor.xyz * ambient, shapeColor.w );
//           gl_FragColor.xyz += phong_model_lights( N );                     // Compute the final color with contributions from lights.
//         }`;
//     }
// }