import type { APIRoute } from 'astro';
import { db, eq, variantTypeValue } from 'astro:db';

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const id = parseInt(params.id!);
    await db.delete(variantTypeValue).where(eq(variantTypeValue.id, id));

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to delete variant type value' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};

export const PUT: APIRoute = async ({ request, params }) => {
  try {
    const id = parseInt(params.id!);
    const data = await request.json();
    
    await db
      .update(variantTypeValue)
      .set({
        name: data.name,
        value: data.value,
        abbreviation: data.abbreviation,
        updated_at: new Date()
      })
      .where(eq(variantTypeValue.id, id));

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to update variant type value' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};