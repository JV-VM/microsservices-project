import { NextFunction } from 'express';
import { Kafka } from 'kafkajs';

const kafkaClient = new Kafka({
  clientId: 'auth-microservice',
  brokers: ['localhost:9092'],
});

const kafkaMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const topic = 'auth-group';
  const message = {
    value: JSON.stringify(req.body), // converte o objeto para string
  };
  try {
    await kafkaClient.producer().send({
      topic,
      messages: [message],
    });
    console.log('Message sent to Kafka topic:', topic);
  } catch (error) {
    console.error('Error sending message to Kafka:', error);
  }

  next(); // call the next middleware or route handler
};

export default kafkaMiddleware;