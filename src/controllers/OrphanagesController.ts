import {Request, Response} from 'express'
import { getRepository } from 'typeorm';
import Orphanage from './../models/Orphanage';
import * as Yup from 'yup';

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
      open_on_weekends,
    } = request.body;

    const OrphanagesRepository = getRepository(Orphanage);

    const requestImages = request.files as Express.Multer.File[];

    const images = requestImages.map(image=>{
     return {path: image.filename}
    })

    const data = {
      name,
      latitude,
      longitude,
      about,
      instructions,
      opening_hours,
      open_on_weekends,
      images,
    };

    const schema = Yup.object().shape({
      name: Yup.string().required(),
      latitude: Yup.number().required(),
      longitude: Yup.number().required(),
      about:Yup.string().required().max(300),
      instructions:Yup.string().required(),
      opening_hours:Yup.string().required(),
      open_on_weekends:Yup.boolean().required(), 
      images: Yup.array(
        Yup.object().shape({
          path: Yup.string().required()
        })
      ),
    })

    await schema.validate(data, {
      abortEarly: false,
    })

    const orphanage = OrphanagesRepository.create(data);

    await OrphanagesRepository.save(orphanage);

    return response.status(201).json(orphanage);
  }
}