import {Kafka, Producer, Admin} from "kafkajs";
import dotenv from "dotenv";
import { TryCatch } from "./tryCatch.js";
import ErrorHandler from "./errorHandler.js";
import { sql } from "./db.js";
dotenv.config();

let producer: Producer;
let admin: Admin;

// Kafka Connection
export const connectKafka = async () => {
    try {
        const kafka = new Kafka({
            clientId: 'auth-service',
            brokers: [process.env.Kafka_Broker || 'localhost:9092']
        });

        admin = kafka.admin();
        await admin.connect();

        const topics = await admin.listTopics();

        if(!topics.includes('send-mail')) { 
            await admin.createTopics({
                topics: [
                    {
                        topic: 'send-mail',
                        numPartitions: 1,
                        replicationFactor: 1
                    },
                ],
            });
            console.log("✅ Topic 'send-mail' created");
        }

        await admin.disconnect();

        producer= kafka.producer();

        await producer.connect();

        console.log("✅ Kafka producer connected");
        
    } catch (error) {
        console.error("❌ Error connecting to Kafka:", error);
    }
}

//Publish message to kafka
export const publishToTopic = async (topic: string, message: any) => {

    if(!producer){
        console.log("❌ Kafka producer is not initialized");
        return;
    }

    try {
        await producer.send({
            topic: topic,
            messages: [
                {
                    value: JSON.stringify(message)
                }
            ]
        });
        console.log(`✅ Message published to topic '${topic}'`);
    } catch (error) {
        console.error('❌ Error publishing message to Kafka', error);
    }
}

export const disconnectKafka = async () => {
    if(producer) {
        producer.disconnect();
    }
 }
