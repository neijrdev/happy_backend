import {Request, Response} from 'express'
import { getRepository } from 'typeorm';
import Orphanage from './../models/Orphanage';
import OrphanageView from '../views/orphanages_views';

export default {
  async index (request: Request, response: Response){
    const OrphanagesRepository = getRepository(Orphanage);
    const orphanages = await OrphanagesRepository.find({
      relations: ['images']
    })

    return response.json(OrphanageView.renderMany(orphanages))
  },

  async show (request: Request, response: Response){
    try {
      const id = request.params.id
      const OrphanagesRepository = getRepository(Orphanage);
      const orphanage = await OrphanagesRepository.findOneOrFail(id)
      return response.json(OrphanageView.render(orphanage))
    } catch (error) {
      return response.status(404).json({error:`id not found`})
    }
  },

  async create(request: Request, response: Response){
    const {
      name,
      latitude,
      longitude,
      about,
      instructions,
      opening_hours,
      open_on_weekends } = request.body;
  
    const OrphanagesRepository = getRepository(Orphanage);

    const requestImages = request.files as Express.Multer.File[];

    const images = requestImages.map(image=>{
     return {path: image.filename}
    })


  
    const orphanage = OrphanagesRepository.create({
      name,
      latitude,
      longitude,
      about,
      instructions,
      opening_hours,
      open_on_weekends,
      images
    });
  
    await OrphanagesRepository.save(orphanage);
  
    return response.status(201).json(orphanage);
  }
}