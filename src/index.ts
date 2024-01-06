import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { cache } from 'hono/cache'
type Bindings = {
  DB: D1Database, 
  USERNAME: string
  PASSWORD: string
}

  const app = new Hono<{ Bindings: Bindings }>()
  
import { basicAuth } from 'hono/basic-auth'

  app.use(
    '*',
    async (c, next ) => {

      console.log(c.env.USERNAME)
      const auth =  basicAuth({
      
        username: c.env.USERNAME,
        password: c.env.PASSWORD,
      })

      return auth(c,next)
    },
    cors({
      origin: ['localhost:3000/*', 'http://localhost:3000', 'http://127.0.0.1:3000/*', 'http://localhost:3000/*' ],
      allowMethods: ['POST', 'GET','UPDATE','DELETE'],
      exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
      maxAge: 60,
      credentials: true,
    }), 
    
   

  )








  
//##################### TRIPS #########################################
//Get, Post, put, patch, delete
app.get(
  '/trip', 
  cache({
    cacheName: 'crosant',
  }), 
  async (c) => {

    try {
        let { results } = await c.env.DB.prepare("SELECT * FROM trip ").bind().all()
        return c.json(results)
      } catch (e) {
        return c.json({err: e}, 500)
      }
    
})




















app.post('/trip',



  async (c) => {
    console.log(+ "  Hellloo o"  )

    const {name}   = await c.req.query()
    if (!name) return c.text("Missing author value for new comment")
    console.log(name)
    //const { duration } = (await db.prepare('INSERT INTO users (name, age) VALUES (?1, ?2)').bind( "John", 42 ).run()).meta;
    const success = await c.env.DB.prepare(`insert into Trip (name) values (?1) `).bind(name).run()
    if (success) {
        c.status(201)
        c.header('Content-Type', 'text/plain')
        return c.body(
          success.meta.last_row_id
        )
    
      } else {
        c.status(500)
        return c.text("Something went wrong")
      }
            

})
app.patch('/trip/:id',async (c) => {
  const {id} = c.req.param()
  const {name}   = await c.req.query()


  if(!id){
    c.status(500)
    return c.text("No ID"); 
  }
  const sucess = await c.env.DB.prepare('UPDATE Trip SET name = ?  WHERE id = ? ').bind( name, id).run(); 
  if(sucess){
    c.status(200);
    return c.text(`Trip id ${id} has been deleted`);
  }
  c.status(500)
  return c.text(`id ${id} is not valid`)



})


app.delete('/trip/:id',async (c) => {
  const {id} = c.req.param()
  console.log(id )

  if(!id){
    c.status(500)
  return c.text("No ID"); 
  }
  const sucess = await c.env.DB.prepare('delete from Trip where id = ? ').bind(id).run(); 
  if(sucess){
    c.status(200);
  return c.text(`Trip id ${id} has been deleted`);


}
c.status(500)
return c.text(`id ${id} is not valid`)

})

//##################### LOCATIONS#########################################
app.get('/trip/:id/locations', 
  cache({
    cacheName: 'crosant',
  }), 
  async (c) => {

    try {
        const { id } = c.req.param()
        let { results } = await c.env.DB.prepare("SELECT * FROM location where trip_id = ?  ").bind(id).all()
        return c.json(results)
      } catch (e) {
        return c.json({err: e}, 500)
      }
    
})
app.get('/trip/location/:id',
  cache({
    cacheName: 'crosant',
  }), 
  async (c) => {
    try {
      const { id } = c.req.param()
      let { results } = await c.env.DB.prepare("SELECT * FROM location where id = ?  ").bind(id).all()
      return c.json(results)
    } catch (e) {
      return c.json({err: e}, 500)
    }
  
})
app.post('/trip/:id/location',async (c) => {
    //id	name	description	trip_id
    const { id } = c.req.param()

    const {  name, description } = await c.req.query()
    console.log(name)
    if (!name) return c.text("Missing author value for new comment")
    //const { duration } = (await db.prepare('INSERT INTO users (name, age) VALUES (?1, ?2)').bind( "John", 42 ).run()).meta;
    const success = await c.env.DB.prepare(`insert into Location (name, description, trip_id) values (?1,?2,?3 ) `).bind(name,description, id).run()
    if (success) {
        c.status(201)
        return c.text("Created")
      } else {
        c.status(500)
        return c.text("Something went wrong")
      }
            
  
})
app.patch('/trip/location/:id',async (c) => {
  const {id} = c.req.param()
  const {  name, description } = await c.req.query()

  if(!id || (!name && !description)){
    c.status(500)
    return c.text("Missing Data"); 
  }
  if( name  ){
      await c.env.DB.prepare('UPDATE Location SET name = ? WHERE id = ? ').bind( name, id).run(); 

  }
  else if(description){
     await c.env.DB.prepare('UPDATE Location SET description = ? WHERE id = ? ').bind( description, id).run(); 

  }
    c.status(200);
    return c.text(`Location with id ${id} has been updated`);




})
app.delete('/trip/location/:id',async (c) => {
  const { id} = c.req.param()

  if(!id ){
    c.status(500)
    return c.text("No ID"); 
  }
  const sucess = await c.env.DB.prepare('delete from Location where id = ? ').bind(id).run(); 
  if(sucess){
    c.status(200);
    return c.text(`Trip Location with id ${id} has been deleted`);


  }
  c.status(500)
  return c.text(`id ${id} is not valid`)
  
})


//##################### TODO #########################################
app.get('/trip/location/:l_id/todo', 
  cache({
    cacheName: 'crosant',
  }), 
  async (c) => {
    console.log("todo")

    try {
        const { l_id } = c.req.param()
        let { results } = await c.env.DB.prepare("SELECT * FROM todo where location_id = ?  ").bind(l_id).all()
        return c.json(results)
      } catch (e) {
        return c.json({err: e}, 500)
      }
  
})

app.post('/trip/location/:l_id/todo', async (c) => {
  const {l_id} = c.req.param()    //id	name	description	links	address	
    const {  name, description, links, address } = await c.req.query()
    console.log( `todo ${name}`)

    if (!name ||  !description ||!links || !address|| !l_id) return c.text("Missing author value for new comment")
    //const { duration } = (await db.prepare('INSERT INTO users (name, age) VALUES (?1, ?2)').bind( "John", 42 ).run()).meta;
    try{
      const success = await c.env.DB.prepare(`insert into todo (name,description,links,address,location_id) values (?1,?2,?3,?4,?5)`)
      .bind( name, description, links, address, l_id)
      .run();  
      if (success) {
          c.status(201)
          return c.text("Created")
        }
        else {
          c.status(500)
          return c.text("Something went wrong")
        }
    }
    catch( e){
      c.status(500)
      return c.text("Something went wrong")
    }
     
    
})
app.patch('/trip/location/todo/:id', async (c) => {
  const {id } = c.req.param()    //id	name	description	links	address	
    const {  name, description, links, address } = await c.req.query()
    console.log(name + "   " + description + " " + links + " " + address )

    if (!id||(!name &&  !description && !links && !address)) {
      c.status(500)
      return c.text("Missing Values")
    }
    try{
        // name !() 1 
        // name, description, 2  
        // name, description, links 
        //name, description, links, address, 
        // description
        // descriptionk, link, 
        //description,link,address, 
        //link
        //link, address
        //address 
        if(name !== undefined){
           await c.env.DB.prepare(`UPDATE Todo SET name = ? WHERE id = ? `).bind(name,id).run();
           console.log(id)
        }
        if(description !== undefined){
          await c.env.DB.prepare(`UPDATE Todo set description = ? WHERE id = ? `).bind(description,id).run()


        }
        if(links !== undefined){
          await c.env.DB.prepare(`UPDATE Todo set links = ? WHERE id = ? `).bind(links,id).run()
       }
       if(address !== undefined){
        await c.env.DB.prepare(`UPDATE Todo set address = ? WHERE id = ? `).bind(address,id).run()
        }
        




       
          c.status(201)
          return c.text("Created")
        
    }
    catch( e){
      c.status(500)
      return c.text("Something went wrong")
    }
     
    
})
app.delete('/trip/location/todo/:id',async (c) => {
  const {  id} = c.req.param()

  if(!id){
    c.status(500)
    return c.text("No ID"); 
  }
  const sucess = await c.env.DB.prepare('delete from todo where id = ?  ').bind(id).run(); 
  if(sucess){
    c.status(200);
    return c.text(`TODO with id ${id} has been deleted`);


  }
  c.status(500)
  return c.text(`id ${id} is not valid`)
  
})







export default app
