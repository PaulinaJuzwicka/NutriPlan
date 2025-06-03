import { supabase } from '../src/lib/supabaseClient';

async function listMedicationsColumns() {
  try {
    const { data, error } = await supabase
      .from('medications')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error fetching medications:', error);
      return;
    }

    if (data && data.length > 0) {
      console.log('Medications table columns:');
      console.log('-------------------------');
      console.log(Object.keys(data[0]));
    } else {
      console.log('No medications found in the database.');
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

listMedicationsColumns();
