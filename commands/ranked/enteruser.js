const { SlashCommandBuilder, PermissionFlagsBits} = require('discord.js');
const Database = require("@replit/database");
const db = new Database()

module.exports = {
  data: new SlashCommandBuilder()
    .setName('enteruser')
    .setDescription('Adds a user to ranked.')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Specify which user to add')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.EditChannels),
  async execute(interaction) {
     const user = interaction.options.getUser('user');
    const name = user.username;
      try {
    // Retrieve the ladder array from the database
    const lb = await db.get('lb') || [];

    // Check if the user with the same name already exists in the ladder
    const existingUser = lb.find((person) => person.name === name);

    if (!existingUser) {
      const newUser = { name, elo: 1000, wins: 0, losses: 0 };
      lb.push(newUser);

      // Update the ladder array in the database
      await db.set('lb', lb);
      await interaction.reply(`Added <@${user.id}> to the ranked leaderboard!.`);
    } else {
      await interaction.reply(`User <@${user.id}> is already registered!.`);
    }
  } catch (error) {
    console.log('Error:', error);
    await interaction.reply('Error:', error);
  }

  },
};