// This file is required for Expo/React Native SQLite migrations - https://orm.drizzle.team/quick-sqlite/expo

import journal from './meta/_journal.json';
import m0000 from './0000_next_bloodscream.sql';
import m0001 from './0001_drop_category_budget_expense.sql';
import m0002 from './0002_friendly_mad_thinker.sql';

  export default {
    journal,
    migrations: {
      m0000,
m0001,
m0002
    }
  }
  