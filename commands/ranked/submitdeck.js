const { SlashCommandBuilder, PermissionFlagsBits} = require('discord.js');
const Database = require("@replit/database");
const db = new Database()
const fs = require('fs');
const axios = require('axios');
const parseString = require('xml2js').parseString;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('submitdeck')
    .setDescription('View your or another user\'s ranked profile.')
    .addAttachmentOption(option =>
      option.setName('deck')
        .setDescription('Attach an XML file of your decklist.')
        .setRequired(true)),
  async execute(interaction) {
    const deck = await interaction.options.getAttachment('deck');
    const cardsArray = await db.get('carddb') || [];
     const response = await axios.get(deck.url);
     const xmlData = response.data;
    try{
    parseString(xmlData, { explicitArray: false }, (err, result) => {
      if (err) {
        console.error(err);
        return;
      }

      // Process main deck
      processDeck(result.deck.main, cardsArray);

      // Process side deck
      processDeck(result.deck.side, cardsArray);

      // Process extra deck
      processDeck(result.deck.extra, cardsArray);

      console.log(cardsArray);
    });
      await db.set('carddb', cardsArray);
      await db.set('decks', 0);
      await interaction.reply('Successfully Uploaded Decklist!');
    }
    catch(error){
    await interaction.reply('Error:', error);
    }
  }}

    function processDeck(deck, cardsArray) {
      if (!deck || !deck.card) return;

      processed = []

      deck.card.forEach(card => {
        const cardName = card._;

        // Find existing card entry in cardsArray by name
        const existingCard = cardsArray.find(c => c.name === cardName);
        const processedCard = processed.find(c => c.name === cardName);
        if (!processedCard) {
          existingCard.decks++;
          processed.push({
                          name: cardName,
                          total: 1,
                          decks: 0,
                          average: 1,
                        });
        }
        if (existingCard) {
          
          // If card already exists, update values
          existingCard.total++;
          existingCard.average = existingCard.total / existingCard.decks;
        } else {
          // If card doesn't exist, add a new entry
          cardsArray.push({
            name: cardName,
            total: 1,
            decks: 0,
            average: 1,
          });
        }
      });
    }