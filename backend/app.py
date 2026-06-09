"""
Omar Clinic Pro - Backend API
Professional Clinic Management System
"""

from flask import Flask, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import os
from datetime import datetime

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
    'DATABASE_URL',
    'sqlite:///clinic.db'
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JSON_SORT_KEYS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')

# Initialize extensions
db = SQLAlchemy(app)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# ==================== Models ====================

class Patient(db.Model):
    """Patient Model"""
    __tablename__ = 'patients'
    
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    date_of_birth = db.Column(db.Date, nullable=False)
    gender = db.Column(db.String(10), nullable=False)
    address = db.Column(db.String(255))
    city = db.Column(db.String(100))
    country = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'email': self.email,
            'phone': self.phone,
            'date_of_birth': self.date_of_birth.isoformat() if self.date_of_birth else None,
            'gender': self.gender,
            'address': self.address,
            'city': self.city,
            'country': self.country,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class Doctor(db.Model):
    """Doctor Model"""
    __tablename__ = 'doctors'
    
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    specialization = db.Column(db.String(100), nullable=False)
    license_number = db.Column(db.String(50), unique=True, nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'email': self.email,
            'phone': self.phone,
            'specialization': self.specialization,
            'license_number': self.license_number,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class Appointment(db.Model):
    """Appointment Model"""
    __tablename__ = 'appointments'
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctors.id'), nullable=False)
    appointment_date = db.Column(db.DateTime, nullable=False)
    reason = db.Column(db.String(255))
    status = db.Column(db.String(20), default='scheduled')  # scheduled, completed, cancelled
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    patient = db.relationship('Patient', backref='appointments')
    doctor = db.relationship('Doctor', backref='appointments')
    
    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'doctor_id': self.doctor_id,
            'appointment_date': self.appointment_date.isoformat(),
            'reason': self.reason,
            'status': self.status,
            'notes': self.notes,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


# ==================== Routes ====================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Omar Clinic Pro API',
        'version': '1.0.0',
        'timestamp': datetime.utcnow().isoformat()
    }), 200


@app.route('/api/patients', methods=['GET'])
def get_patients():
    """Get all patients"""
    try:
        patients = Patient.query.all()
        return jsonify({
            'success': True,
            'data': [patient.to_dict() for patient in patients],
            'count': len(patients)
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/patients/<int:patient_id>', methods=['GET'])
def get_patient(patient_id):
    """Get patient by ID"""
    try:
        patient = Patient.query.get(patient_id)
        if not patient:
            return jsonify({
                'success': False,
                'error': 'Patient not found'
            }), 404
        return jsonify({
            'success': True,
            'data': patient.to_dict()
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/doctors', methods=['GET'])
def get_doctors():
    """Get all doctors"""
    try:
        doctors = Doctor.query.filter_by(is_active=True).all()
        return jsonify({
            'success': True,
            'data': [doctor.to_dict() for doctor in doctors],
            'count': len(doctors)
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/appointments', methods=['GET'])
def get_appointments():
    """Get all appointments"""
    try:
        appointments = Appointment.query.all()
        return jsonify({
            'success': True,
            'data': [appointment.to_dict() for appointment in appointments],
            'count': len(appointments)
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        'success': False,
        'error': 'Resource not found'
    }), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    db.session.rollback()
    return jsonify({
        'success': False,
        'error': 'Internal server error'
    }), 500


# ==================== CLI Commands ====================

@app.cli.command()
def init_db():
    """Initialize the database"""
    db.create_all()
    print('Database initialized successfully!')


@app.cli.command()
def seed_db():
    """Seed the database with sample data"""
    # Add sample patients
    patient1 = Patient(
        first_name='أحمد',
        last_name='محمد',
        email='ahmad@example.com',
        phone='+966501234567',
        date_of_birth='1990-01-15',
        gender='M',
        address='شارع النيل',
        city='الرياض',
        country='السعودية'
    )
    
    patient2 = Patient(
        first_name='فاطمة',
        last_name='علي',
        email='fatima@example.com',
        phone='+966509876543',
        date_of_birth='1995-05-20',
        gender='F',
        address='شارع الملك',
        city='جدة',
        country='السعودية'
    )
    
    # Add sample doctors
    doctor1 = Doctor(
        first_name='محمد',
        last_name='حسن',
        email='dr.hassan@example.com',
        phone='+966555555555',
        specialization='عام',
        license_number='LIC001'
    )
    
    doctor2 = Doctor(
        first_name='سارة',
        last_name='أحمد',
        email='dr.sarah@example.com',
        phone='+966555555556',
        specialization='أسنان',
        license_number='LIC002'
    )
    
    db.session.add_all([patient1, patient2, doctor1, doctor2])
    db.session.commit()
    print('Database seeded successfully!')


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='0.0.0.0', port=5000)
