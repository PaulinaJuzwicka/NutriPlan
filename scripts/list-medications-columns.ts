import { supabase } from '../src/lib/supabaseClient';

async function listMedicationsColumns() {
  try {
    const { data, error } = await supabase
      .from('medications')
      .select('*')
      .limit(1);

    if (error) {
      return;
    }

    if (data && data.length > 0) {
    } else {
    }
  } catch (err) {
  }
}

listMedicationsColumns();
