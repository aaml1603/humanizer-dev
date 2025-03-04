import stripe
from flask import Flask, request, jsonify
from modules import dbhandle

# Set your Stripe secret key
stripe.api_key = "sk_test_your_key_here"

# Set your webhook secret
webhook_secret = "whsec_your_webhook_secret_here"

db = dbhandle.MongoDB()

def handle_webhook(app):
    @app.route('/webhook', methods=['POST'])
    def webhook():
        payload = request.data
        sig_header = request.headers.get('Stripe-Signature')

        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, webhook_secret
            )
        except ValueError as e:
            # Invalid payload
            return jsonify({'error': str(e)}), 400
        except stripe.error.SignatureVerificationError as e:
            # Invalid signature
            return jsonify({'error': str(e)}), 400

        # Handle the event
        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']
            
            # Fulfill the order
            fulfill_order(session)
        elif event['type'] == 'customer.subscription.created':
            subscription = event['data']['object']
            
            # Handle subscription creation
            handle_subscription_created(subscription)
        elif event['type'] == 'customer.subscription.updated':
            subscription = event['data']['object']
            
            # Handle subscription update
            handle_subscription_updated(subscription)
        elif event['type'] == 'customer.subscription.deleted':
            subscription = event['data']['object']
            
            # Handle subscription deletion
            handle_subscription_deleted(subscription)
        
        return jsonify({'status': 'success'}), 200

def fulfill_order(session):
    # This function would update the user's subscription in your database
    # based on the completed checkout session
    customer_id = session.get('customer')
    subscription_id = session.get('subscription')
    
    # In a real implementation, you would:
    # 1. Look up the user by the Stripe customer ID
    # 2. Update their subscription status
    # 3. Update their word limit based on the plan
    print(f"Fulfilling order for customer {customer_id}, subscription {subscription_id}")

def handle_subscription_created(subscription):
    # Handle when a subscription is created
    customer_id = subscription.get('customer')
    status = subscription.get('status')
    plan_id = subscription.get('plan', {}).get('id')
    
    print(f"Subscription created for customer {customer_id}: {plan_id} ({status})")

def handle_subscription_updated(subscription):
    # Handle when a subscription is updated
    customer_id = subscription.get('customer')
    status = subscription.get('status')
    plan_id = subscription.get('plan', {}).get('id')
    
    print(f"Subscription updated for customer {customer_id}: {plan_id} ({status})")

def handle_subscription_deleted(subscription):
    # Handle when a subscription is canceled
    customer_id = subscription.get('customer')
    
    print(f"Subscription canceled for customer {customer_id}")

